import express from 'express';
import { get_index, get_query, upsert_query } from "./database/db.js";
import { upsert_using_key_value_patterns_and_JSONSchema } from './database/queryLogic.js';
import Ajv from 'ajv';
import { program } from "commander";
import dotenv from 'dotenv';

// Nostr specific imports
import * as nip19 from 'nostr-tools/nip19';
import { generateSecretKey, getPublicKey } from 'nostr-tools/pure';
import { finalizeEvent, verifyEvent } from 'nostr-tools'

// libs folder
import { setup } from './lib/setup.js';
import { generate_nostr_dot_json } from './lib/generate_nostr_dot_json.js';

// Setup default Varaibles
let dotenv_config = dotenv.config()
if (Object.keys(dotenv_config).includes("parsed")) {
    if (Object.keys(dotenv_config.parsed).includes("NOSTR_ADMIN_PUBLIC_KEY")) {
        console.log("GOT THE PUBLIC KEY")
    }
}
let levelPath = './database/db.leveldb'


// START COMMANDER STUFF
program
    .option('-lp, --levelPath <string>')
program.parse();
const options = program.opts();
if (Object.keys(options).length == 0) {
    console.log(`Defaulting to default levelPath=${levelPath}`)
}
else {
    if (Object.keys(options).includes("levelPath")) {
        levelPath = options.levelPath
        console.log(`Using levelPath=${levelPath}`)
    }
}
// END Commander Stuff


var app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json())

let level_schema_config = await setup(levelPath, process)


app.get('/', (req, res) => {
    res.send("Hello, World! This is a GET request. <a href='/.well-known/nostr.json'>Well Known</a>");
});


app.get('/.well-known/nostr.json', async (req, res) => {
    let get_nostr_dot_json = await get_index(
        level_schema_config.dddb,
        "nostr_json",
        `nostr_`
    )

    if (Object.keys(get_nostr_dot_json).length == 0) {
        res.send({ "status": "To Set" })
    }
    else {
        get_nostr_dot_json = await level_schema_config.CID_store.get(get_nostr_dot_json[Object.keys(get_nostr_dot_json)[0]]["/"])
        res.send(get_nostr_dot_json);
    }

});

app.get("/appnames", async function (req, res) {
    res.send({
        app_name: level_schema_config.db_schema.app_names,
        app_key: await level_schema_config.dddb.get("root")
    })
})

app.post("/napi", async function (req, res) {
    // Validate the message is signed
    let event_is_verified = await verifyEvent(req.body)
    if (!event_is_verified) {
        res.send({ "error": "event could not be verified" })
        return false
    }
    let command_JSON = JSON.parse(req.body.content)
    if (req.body.tags[0][0] != 'DD') {
        res.send({ "error": "event missing tag 'DD'" })
        return false
    }
    // Validate app_name
    if (!level_schema_config.db_schema.app_names.includes(command_JSON.app_name)) {
        res.send({ "error": "Invalid app_name please check GET /appnames" })
        return false
    }
    // Validate app_key
    let app_key = await level_schema_config.dddb.get("root")
    if (app_key != command_JSON.app_key) {
        res.send({ "error": "Invalid app_key please check GET /appnames" })
        return false
    }
    // Validate the query name
    if (!Object.keys(level_schema_config.app_root).includes(command_JSON.query_object.name)) {
        res.send({
            "error": `App ${command_JSON.query_object.name} not corectly installed \n
            ${JSON.stringify(level_schema_config.app_root)}`
        })
        return false
    }
    // Reverse lookup the users roles
    let query_roles = await get_index(
        level_schema_config.dddb,
        "RBAC.root_RBAC.secp256k1_auth_app",
        `spec_`
    )
    // console.log("query_roles")
    // console.log(query_roles)

    // Get the roles as a list
    let roles = []
    for (const tmp_role of Object.keys(query_roles)) {
        if (tmp_role.includes(String(req.body.pubkey))) {
            let test_enabled = await level_schema_config.CID_store.get(query_roles[tmp_role]["/"])
            if (test_enabled.enabled == true) {
                roles.push(tmp_role.slice(`spec_%${req.body.pubkey}%_app_rule_`.length + 1, tmp_role.length - 1))
            }
        }
    }
    console.log("\n")
    console.log("roles")
    console.log(roles)

    // Impliment raw RBAC for each query
    if (command_JSON.query_object.name == "apps.nostr_NIP05_relay_map.NIP05_internet_identifier") {
        if (command_JSON.query_type == "upsert") {
            if (roles.includes("root")) {
                let current_app_store = level_schema_config.app_data.sublevel(level_schema_config.app_root["apps.nostr_NIP05_relay_map.NIP05_internet_identifier"], { valueEncoding: 'json' })
                let query_result = await upsert_using_key_value_patterns_and_JSONSchema(
                    level_schema_config.CID_store,
                    current_app_store,
                    level_schema_config.db_schema.schema['apps.nostr_NIP05_relay_map.NIP05_internet_identifier'].key_value_patterns,
                    command_JSON.query_object.data,
                    level_schema_config.db_schema.schema['apps.nostr_NIP05_relay_map.NIP05_internet_identifier'].upsert_json_schema)




                // Create nostr.json
                try {
                    console.log("command_JSON")
                    console.log(command_JSON)
                    await generate_nostr_dot_json(level_schema_config, command_JSON) 
                    res.send({"status" : "success"})  
                    return true
                } catch (error) {
                    res.send({ "status": "error", "description": "generate_nostr_dot_json(level_schema_config) could not build correctly" })
                    return true
                }
            } else {
                if (roles.includes("nip05_user")) {
                    // Check if variables are present
                    let current_app_store = level_schema_config.app_data.sublevel(level_schema_config.app_root["apps.nostr_NIP05_relay_map.NIP05_internet_identifier"], { valueEncoding: 'json' })
                    const ajv = new Ajv()
                    const JSONSchema_validator = ajv.compile(level_schema_config.db_schema.schema["apps.nostr_NIP05_relay_map.NIP05_internet_identifier"].upsert_json_schema)
                    const JSONSchema_test = JSONSchema_validator(command_JSON.query_object.data)
                    if (!JSONSchema_test) {
                        res.send({ "status": "ERROR", "Reason": "JSONSchema Test failed" })
                        return true
                    }
                    if (command_JSON.query_object.data.variables.NOSTR_PUBLIC_KEY != req.body.pubkey) {
                        res.send({ "status": "ERROR", "Reason": "Bro your signing key and variable NOSTR_PUBLIC_KEY don't match" })
                        return true
                    }
                    if (command_JSON.query_object.data.value.NOSTR_PUBLIC_KEY != req.body.pubkey) {
                        res.send({ "status": "ERROR", "Reason": "Bro your signing key and value NOSTR_PUBLIC_KEY don't match" })
                        return true
                    }
                    // We need to look up the NOSTR_NAME_LOCAL_PART
                    let nostr_local_index = await get_index(
                        level_schema_config.dddb,
                        "apps.nostr_NIP05_relay_map.NIP05_internet_identifier",
                        "NIP05_public_key_"
                    )
                    let prcoess_local_part = []
                    for (const tmp_local_part of Object.keys(nostr_local_index)) {
                        if (tmp_local_part.slice(0, "nip05_public_key_".length) == "nip05_public_key_") {
                            prcoess_local_part.push(tmp_local_part)
                        }
                    }
                    let data_tracker = []
                    for (const variable_keys of prcoess_local_part) {
                        const regex = /\%(.*?)\%/g;
                        let match;
                        while ((match = regex.exec(variable_keys)) !== null) {
                            data_tracker.push(match[1])
                        }
                    }
                    // TODO do some if comparisons
                    try {
                        await upsert_using_key_value_patterns_and_JSONSchema(
                            level_schema_config.CID_store,
                            current_app_store,
                            level_schema_config.db_schema.schema["apps.nostr_NIP05_relay_map.NIP05_internet_identifier"].key_value_patterns,
                            command_JSON.query_object.data,
                            level_schema_config.db_schema.schema["apps.nostr_NIP05_relay_map.NIP05_internet_identifier"].upsert_json_schema
                        )
                    } catch (error) {
                        res.send({ "status": "ERROR", "Reason": "problem with query_object", "description": error })
                        return true
                    }
                    try {
                        await generate_nostr_dot_json(level_schema_config, command_JSON)   
                    } catch (error) {
                        res.send({ "status": "error", "description": "generate_nostr_dot_json(level_schema_config) could not build correctly" })
                        return true
                    }
                    res.json({ "status": "success"})
                    return true
                }
            }
        }
    }
    if (command_JSON.query_object.name == "RBAC.root_RBAC.secp256k1_auth_app") {
        if (command_JSON.query_type == "upsert") {
            if (roles.includes("root")) {
                console.log("THIS_PART_WORKS")
                let current_app_store = level_schema_config.app_data.sublevel(level_schema_config.app_root["RBAC.root_RBAC.secp256k1_auth_app"], { valueEncoding: 'json' })
                let query_result = null;
                try {
                    query_result = await upsert_using_key_value_patterns_and_JSONSchema(
                        level_schema_config.CID_store,
                        current_app_store,
                        level_schema_config.db_schema.schema["RBAC.root_RBAC.secp256k1_auth_app"].key_value_patterns,
                        command_JSON.query_object.data,
                        level_schema_config.db_schema.schema["RBAC.root_RBAC.secp256k1_auth_app"].upsert_json_schema
                    )
                } catch (error) {
                    res.send({ "ERROR": "query_result did not work", "description": error })
                    return true
                }
                res.send({status : "success"})
                return true
            }
        }
    }
    if (command_JSON.query_object.name == "RBAC.DD_token_RBAC.deploy") {
        if (command_JSON.query_type == "upsert") {
            if (roles.includes("root")) {
                const ajv = new Ajv()
                const JSONSchema_validator = ajv.compile(level_schema_config.db_schema.functions['RBAC.DD_token_RBAC.deploy'].deploy.JSON_schema)
                const JSONSchema_test = JSONSchema_validator(command_JSON.query_object.data)
                if (!JSONSchema_test) {
                    res.send({ "status": "ERROR", "Reason": "JSON_schema Test failed" })
                    return true
                }
                // Validate version
                if(command_JSON.query_object.data.version != "0.0.1"){
                    res.send({ "status": "ERROR", "Reason": "Wrong version number, please set to 0.0.1" })
                    return true
                }
                // Validate app_name
                if(command_JSON.query_object.data.app_name != "DD_token"){
                    res.send({ "status": "ERROR", "Reason": "Please set app_name to DD_token" })
                    return true
                }
                // Same signing key as nostr event
                if(req.body.pubkey != command_JSON.query_object.data.signing_public_key){
                    res.send({ "status": "ERROR", "Reason": "data.signing_public_key must be the same as the address sending the nostr event" })
                    return true
                }
                // Validate Timestamp
                let current_timestamp_ms = Date.now();
                let ms_offset = 1000 * 60 * 60 * 24
                if(
                    command_JSON.query_object.data.datatimestamp_ms < current_timestamp_ms - ms_offset && 
                    command_JSON.query_object.data.datatimestamp_ms > current_timestamp_ms + ms_offset
                )
                {
                    res.send({ "status": "ERROR", "Reason": "That timestamp is either a day in the past or future, please try again" })
                    return true
                }
                // Validate that inital_token_admins are all nostr keys
                try {
                    for(const key_to_check of command_JSON.query_object.data.operation_data.inital_token_admins){
                        await nip19.decode(key_to_check).data
                    }
                } catch (error) {
                    res.send({ "status": "ERROR", "Reason": "data.operation_data.inital_token_admins are not all nostr public keys" })
                    return true
                }
                // Validate the Token Admin is the same as signing key for nostr event
                // #TODO we technically don't need to do this

                // Update token_IDs
                // Update token_state

                let current_app_store = level_schema_config.app_data.sublevel(level_schema_config.app_root["RBAC.root_RBAC.secp256k1_auth_app"], { valueEncoding: 'json' })
                let query_result = null;
                try {
                    query_result = await upsert_using_key_value_patterns_and_JSONSchema(
                        level_schema_config.CID_store,
                        current_app_store,
                        level_schema_config.db_schema.schema["RBAC.root_RBAC.secp256k1_auth_app"].key_value_patterns,
                        command_JSON.query_object.data,
                        level_schema_config.db_schema.schema["RBAC.root_RBAC.secp256k1_auth_app"].upsert_json_schema
                    )
                } catch (error) {
                    res.send({ "ERROR": "query_result did not work", "description": error })
                    return true
                }
                res.send({status : "success"})
                return true
            }
        }
    }

    try {
        res.send({status : "ERROR"})
        return true
    } catch (err) {
        console.log(err)
        // res.send({"status" : "error"})
        return true
    }
})

app.post('/admin', async function (req, res) {
    // Validate that that message is sigend
    // * Set records manually via jq
    // Get all DNS names
    // * Add, or deactivate DNS names
    // * Add nostr identities
    // * [[CRUD]] coupon codes
    // * [[CRUD]] pricing
    // * NLBits configures (LATER)

    console.log(req.body)
    try {
        // Actually do or calculate something
        console.log(req.body)
        res.send(req.body)
    } catch (err) {
        res.send(err)
    }
})

app.post('/coupon', async function (req, res) {
    // Check if coupon code if valid and what domains it supports
    // Claim coupon code


    console.log("\n\n")
    console.log("Request to /coupon")
    console.log(req.body)
    try {
        // Actually do or calculate something
        console.log(req.body)
        res.send(req.body)
    } catch (err) {
        res.send(err)
    }
})


app.post('/update', async function (req, res) {
    // Set relays as a list
    // This should also be doable via a nostr message to the server #TODO


    console.log("\n\n")
    console.log("Request to /update")
    console.log(req.body)
    try {
        // Actually do or calculate something
        console.log(req.body)
        res.send(req.body)
    } catch (err) {
        res.send(err)
    }
})


app.post('/purchase', async function (req, res) {
    // Not implimented should produce an error


    console.log("\n\n")
    console.log("Request to /purchase")
    console.log(req.body)
    try {
        res.send(req.body)
    } catch (err) {
        res.send(err)
    }
})


var server = app.listen(8081, function () {
    var host = server.address().address
    var port = server.address().port
    console.log("\n\nExample app listening at http://%s:%s", host, port)
})