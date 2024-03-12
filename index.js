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

// IPFS CID imports
import { encode, decode } from '@ipld/dag-json'
import { CID } from 'multiformats'
import { sha256 } from 'multiformats/hashes/sha2'

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
    console.log("level_schema_config.db_schema.functions")
    console.log(level_schema_config.db_schema)
    if (
        !level_schema_config.db_schema.app_names.includes(command_JSON.app_name) &&
        !Object.keys(level_schema_config.db_schema.functions).includes(command_JSON.app_name)
    ) {
        res.send({
            "error": "Invalid app_name please check GET /appnames",
            "description": `${command_JSON.app_name}`
        })
        return false
    }
    // Validate app_key
    let app_key = await level_schema_config.dddb.get("root")
    if (app_key != command_JSON.app_key) {
        res.send({ "error": "Invalid app_key please check GET /appnames" })
        return false
    }
    // Validate the query name
    if (!Object.keys(level_schema_config.app_root).includes(command_JSON.query_object.name) &&
        !Object.keys(level_schema_config.db_schema.functions).includes(command_JSON.query_object.name)) {
        res.send({
            "error": `App ${command_JSON.query_object.name} not correctly installed \n
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
                    // console.log("command_JSON")
                    // console.log(command_JSON)
                    await generate_nostr_dot_json(level_schema_config, command_JSON)
                    res.send({ "status": "success" })
                    return true
                } catch (error) {
                    res.send({ 
                        "status": "error", 
                        "description": "generate_nostr_dot_json(level_schema_config) could not build correctly" 
                    })
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
                        res.send({ 
                            "status": "ERROR", 
                            "Reason": "JSONSchema Test failed" 
                        })
                        return true
                    }
                    if (command_JSON.query_object.data.variables.NOSTR_PUBLIC_KEY != req.body.pubkey) {
                        res.send({ 
                            "status": "ERROR", 
                            "Reason": "Bro your signing key and variable NOSTR_PUBLIC_KEY don't match" 
                        })
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
                        res.send({ 
                            "status": "ERROR", 
                            "Reason": "problem with query_object", 
                            "description": error 
                        })
                        return true
                    }
                    try {
                        await generate_nostr_dot_json(level_schema_config, command_JSON)
                        res.send({ 
                            "status": "success", 
                            "description": "Upserted upsert_using_key_value_patterns_and_JSONSchema correctly" 
                        })
                        return true
                    } catch (error) {
                        res.send({ 
                            "status": "error", 
                            "description": "generate_nostr_dot_json(level_schema_config) could not build correctly" 
                        })
                        return true
                    }
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
                res.send({ status: "success" })
                return true
            }
        }
    }
    if (command_JSON.query_object.name == "RBAC.DD_token_RBAC.deploy") {
        if (command_JSON.query_type == "upsert") {
            if (roles.includes("root")) {
                // Perform JSON_schema test on function data
                const ajv = new Ajv()
                const JSONSchema_validator = ajv.compile(level_schema_config.db_schema.functions['RBAC.DD_token_RBAC.deploy'].JSON_schema)
                const JSONSchema_test = JSONSchema_validator(command_JSON.query_object.data)
                if (!JSONSchema_test) {
                    res.send({
                        "status": "ERROR",
                        "Reason": "JSON_schema Test failed",
                        "data": {
                            JSON_schema: level_schema_config.db_schema.functions['RBAC.DD_token_RBAC.deploy'].JSON_schema,
                            JSON_data: command_JSON.query_object.data
                        }
                    })
                    return true
                }
                // Validate version
                if (command_JSON.query_object.data.value.version != "0.0.1") {
                    res.send({ 
                        "status": "ERROR", 
                        "Reason": "Wrong version number, please set to 0.0.1" 
                    })
                    return true
                }
                // Validate app_name
                if (command_JSON.query_object.data.value.app_name != "DD_token_RBAC") {
                    res.send({ 
                        "status": "ERROR", 
                        "Reason": "Please set app_name to DD_token" 
                    })
                    return true
                }
                // Same signing key as nostr event
                if (req.body.pubkey != await nip19.decode(command_JSON.query_object.data.value.signing_public_key).data) {
                    res.send({ 
                        "status": "ERROR", 
                        "Reason": "data.signing_public_key must be the same as the address sending the nostr event" 
                    })
                    return true
                }
                // Validate Timestamp
                let current_timestamp_ms = Date.now();
                let ms_offset = 1000 * 60 * 60 * 24
                if (
                    command_JSON.query_object.data.datatimestamp_ms < current_timestamp_ms - ms_offset &&
                    command_JSON.query_object.data.datatimestamp_ms > current_timestamp_ms + ms_offset
                ) {
                    res.send({ 
                        "status": "ERROR", 
                        "Reason": "That timestamp is either a day in the past or future, please try again" })
                    return true
                }
                // Validate that inital_token_admins are all nostr keys
                try {
                    for (const key_to_check of command_JSON.query_object.data.value.operation_data.inital_token_admins) {
                        let admin_key = await nip19.decode(key_to_check)
                    }
                } catch (error) {
                    res.send({
                        "status": "ERROR",
                        "Reason": "data.operation_data.inital_token_admins are not all nostr public keys",
                        "error": `${error}`,
                        "data": `${command_JSON.query_object.data.value.operation_data.inital_token_admins}`
                    })
                    return true
                }
                // Validate the Token Admin is the same as signing key for nostr event
                // #TODO we technically don't need to do this

                // Calculate token_ID
                const JSON_code = 0x0200
                let encoded = encode(command_JSON.query_object.data.value)
                let hash = await sha256.digest(encoded)
                let cidv1 = CID.create(1, JSON_code, hash)
                // Validate token ID matches what user said
                if (String(cidv1) != command_JSON.query_object.data.variables.TOKEN_ID) {
                    res.send({ "ERROR": "TOKEN_ID sent in the variables part does not match the CID generated on the server" })
                    return true
                }
                // Check if token_ID exists
                // #TODO we use ms on the timestamp, we can skip this for now cause POC

                // Update token_IDs
                // Update token_state

                let current_app_store = level_schema_config.app_data.sublevel(level_schema_config.app_root["RBAC.DD_token_RBAC.token_IDs"], { valueEncoding: 'json' })
                let query_result = null;
                try {
                    query_result = await upsert_using_key_value_patterns_and_JSONSchema(
                        level_schema_config.CID_store,
                        current_app_store,
                        level_schema_config.db_schema.schema["RBAC.DD_token_RBAC.token_IDs"].key_value_patterns,
                        command_JSON.query_object.data,
                        level_schema_config.db_schema.schema["RBAC.DD_token_RBAC.token_IDs"].upsert_json_schema
                    )
                    if (query_result != true) {
                        res.send({
                            "status": "error",
                            "description": "query_result did not work for RBAC.DD_token_RBAC.token_IDs JSON Schema was invalid",
                            "data": query_result
                        })
                        return true
                    }
                } catch (error) {
                    res.send({
                        "status": "error",
                        "description": "query_result did not work for RBAC.DD_token_RBAC.token_IDs upsert_using_key_value_patterns_and_JSONSchema errored out",
                        "data": error
                    })
                    return true
                }
                // #TODO get the next transaction, check if it is equal to zero
                // Gotta do a timestamp comparison


                current_app_store = level_schema_config.app_data.sublevel(level_schema_config.app_root["RBAC.DD_token_RBAC.token_state"], { valueEncoding: 'json' })
                query_result = null;
                try {
                    query_result = await upsert_using_key_value_patterns_and_JSONSchema(
                        level_schema_config.CID_store,
                        current_app_store,
                        level_schema_config.db_schema.schema["RBAC.DD_token_RBAC.token_state"].key_value_patterns,
                        {
                            "variables": {
                                "TOKEN_ID": String(cidv1)
                            },
                            "value": {
                                "token_ID": String(cidv1),
                                "token_transaction_count": 0,
                                "last_transaction_timestamp_ms": 0 //command_JSON.query_object.data.value.datatimestamp_ms

                            }
                        },
                        level_schema_config.db_schema.schema["RBAC.DD_token_RBAC.token_state"].upsert_json_schema
                    )
                    if (query_result != true) {
                        res.send({
                            "status": "error",
                            "description": "query_result did not work for RBAC.DD_token_RBAC.token_state",
                            "data": query_result
                        })
                        return true
                    }
                    res.send({ "status": "success", "Description": "RBAC.DD_token_RBAC.token_state should be set" })
                    return true
                } catch (error) {
                    res.send({ "ERROR": "query_result did not work for RBAC.DD_token_RBAC.token_state", "description": error })
                    return true
                }
            }
        }
    }
    if (command_JSON.query_object.name == "RBAC.DD_token_RBAC.mint") {
        if (command_JSON.query_type == "upsert") {
            if (roles.includes("root")) {
                // Perform JSON_schema test on function data
                const ajv = new Ajv()
                const JSONSchema_validator = ajv.compile(level_schema_config.db_schema.functions['RBAC.DD_token_RBAC.mint'].JSON_schema)
                const JSONSchema_test = JSONSchema_validator(command_JSON.query_object.data.value)
                if (!JSONSchema_test) {
                    res.send({
                        "status": "ERROR",
                        "Reason": "JSON_schema Test failed",
                        "data": {
                            JSON_schema: level_schema_config.db_schema.functions['RBAC.DD_token_RBAC.deploy'].JSON_schema,
                            JSON_data: command_JSON.query_object.data
                        }
                    })
                    return true
                }
                // Validate version
                if (command_JSON.query_object.data.value.version != "0.0.1") {
                    res.send({ 
                        "status": "ERROR", 
                        "Reason": "Wrong version number, please set to 0.0.1" })
                    return true
                }
                // Validate app_name
                if (command_JSON.query_object.data.value.app_name != "DD_token_RBAC") {
                    res.send({ 
                        "status": "ERROR", 
                        "Reason": "Please set app_name to DD_token" 
                    })
                    return true
                }
                // Same signing key as nostr event
                if (req.body.pubkey != await nip19.decode(command_JSON.query_object.data.value.signing_public_key).data) {
                    res.send({ 
                        "status": "ERROR", 
                        "Reason": "data.signing_public_key must be the same as the address sending the nostr event" 
                    })
                    return true
                }
                // Check if token_ID exists and validate if it exists
                let token_ID_data = null;
                try {
                    let query_object = {
                        "name": "RBAC.DD_token_RBAC.token_IDs",
                        "data": {
                            "variables": {
                                TOKEN_ID: command_JSON.query_object.data.value.token_ID
                            }
                        }
                    }
                    token_ID_data = await get_query(
                        level_schema_config.dddb,
                        level_schema_config.db_schema,
                        query_object
                    )
                    if (Object.keys(token_ID_data).length == 0 || token_ID_data == null) {
                        res.send({
                            "status": "ERROR",
                            "Reason": "Unable to find token_ID",
                            "description": `${command_JSON.query_object.data.value.token_ID}`,
                            "data": token_ID_data
                        })
                        return true
                    }
                } catch (error) {
                    res.send({
                        "status": "ERROR",
                        "Reason": "Unable to find token_ID",
                        "description": `${command_JSON.query_object.data.value.token_ID}`,
                        "data": token_ID_data
                    })
                    return true
                }
                // Get the token_state
                let token_state_data = null;
                try {
                    let query_object = {
                        "name": "RBAC.DD_token_RBAC.token_state",
                        "data": {
                            "variables": {
                                TOKEN_ID: command_JSON.query_object.data.value.token_ID
                            }
                        }
                    }
                    token_state_data = await get_query(
                        level_schema_config.dddb,
                        level_schema_config.db_schema,
                        query_object
                    )
                } catch (error) {
                    res.send({
                        "status": "ERROR",
                        "Reason": "Unable to get token_state using token_ID",
                        "data": token_state_data,
                        "description": `${command_JSON.query_object.data.value.token_ID}`,
                        "error": error
                    })
                    return true
                }
                // Validate Timestamp
                let current_timestamp_ms = Date.now(); + (1000 * 10)
                if (
                    command_JSON.query_object.data.value.datatimestamp_ms < token_state_data.last_transaction_timestamp_ms &&
                    current_timestamp_ms > command_JSON.query_object.data.value.datatimestamp_ms
                ) {
                    res.send({ 
                        "status": "ERROR", 
                        "Reason": `That timestamp is not larger than ${token_state_data.last_transaction_timestamp_ms} and less than ${tcurrent_timestamp_ms}` })
                    return true
                }
                // Validate that token mint amount is valid
                if (Number(token_ID_data.operation_data.limit_per_mint) < Number(command_JSON.query_object.data.value.operation_data.amount)) {
                    res.send({
                        "status": "ERROR",
                        "Reason": "Invalid mint amount",
                        "description": `Max amount is ${token_ID_data.operation_data.limit_per_mint}`,
                    })
                    return true
                }
                // Validate that signing key is admin
                let tmp_public_key = await nip19.npubEncode(String(req.body.pubkey))
                if (!token_ID_data.operation_data.inital_token_admins.includes(tmp_public_key)) {
                    res.send({
                        "status": "ERROR",
                        "Reason": "Invalid mint amount",
                        "description": `Invalid token admin we got ${tmp_public_key} which is not in list \n ${JSON.stringify(token_ID_data.operation_data.inital_token_admins)}`,
                    })
                    return true
                }
                // Store Transactions
                let query_result = null;
                let tmp_input_data = null;
                try {
                    // console.log("token_state_data.token_transaction_count")
                    // console.log(token_state_data.token_transaction_count)
                    // console.log(command_JSON.query_object.data.value.token_ID)
                    // console.log(req.body.pubkey)
                    // console.log(token_state_data.token_transaction_count)
                    tmp_input_data = {
                        "variables": {
                            "TOKEN_ID": command_JSON.query_object.data.value.token_ID,
                            "TOKEN_TRANSACTION_NUM": token_state_data.token_transaction_count,
                            "secp256k1_PUBLIC_KEY": req.body.pubkey
                        },
                        "value": {
                            "token_ID": command_JSON.query_object.data.value.token_ID,
                            "token_transaction_count": token_state_data.token_transaction_count,
                            "last_transaction_timestamp_ms": command_JSON.query_object.data.value.timestamp_ms

                        }
                    }
                    console.log("tmp_input_data")
                    console.log(tmp_input_data)
                    let current_app_store = level_schema_config.app_data.sublevel(level_schema_config.app_root["RBAC.DD_token_RBAC.token_transactions"], { valueEncoding: 'json' })
                    query_result = await upsert_using_key_value_patterns_and_JSONSchema(
                        level_schema_config.CID_store,
                        current_app_store,
                        level_schema_config.db_schema.schema["RBAC.DD_token_RBAC.token_transactions"].key_value_patterns,
                        tmp_input_data,
                        level_schema_config.db_schema.schema["RBAC.DD_token_RBAC.token_state"].upsert_json_schema
                    )
                } catch (error) {
                    res.send({
                        "status": "ERROR",
                        "Reason": "Could not store transaction",
                        "error": `${error}`,
                        "data": `${JSON.stringify(tmp_input_data)}`
                    })
                    return true
                }
                // Get balence of who we are minting tokens for
                let query_object = null;
                try {
                    query_object = {
                        "name": "RBAC.DD_token_RBAC.token_balances",
                        "data": {
                            "variables": {
                                TOKEN_ID: command_JSON.query_object.data.value.token_ID,
                                secp256k1_PUBLIC_KEY: req.body.pubkey
                            }
                        }
                    }
                    token_state_data = await get_query(
                        level_schema_config.dddb,
                        level_schema_config.db_schema,
                        query_object
                    )
                    try {
                        // Well you gotta get the balance first before we can update it

                        // Update balence of who we are minting tokens for
                        query_object.data.values = { value: command_JSON.query_object.data.value.operation_data.amount }
                        let current_app_store = level_schema_config.app_data.sublevel(level_schema_config.app_root["RBAC.DD_token_RBAC.token_balances"], { valueEncoding: 'json' })
                        query_result = await upsert_using_key_value_patterns_and_JSONSchema(
                            level_schema_config.CID_store,
                            current_app_store,
                            level_schema_config.db_schema.schema["RBAC.DD_token_RBAC.token_balances"].key_value_patterns,
                            query_object.data,
                            level_schema_config.db_schema.schema["RBAC.DD_token_RBAC.token_balances"].upsert_json_schema
                        )
                    } catch (error) {
                        res.send({
                            "status": "ERROR",
                            "Reason": "Could not store updated balence in RBAC.DD_token_RBAC.token_transactions Minting",
                            "error": `${error}`,
                        })
                        return true
                    }
                } catch (error) {
                    // Insert user balnace for this token
                    query_object = {
                        "name": "RBAC.DD_token_RBAC.token_balances",
                        "data": {
                            "variables": {
                                TOKEN_ID: command_JSON.query_object.data.value.token_ID,
                                secp256k1_PUBLIC_KEY: req.body.pubkey
                            },
                            "value": {
                                "value": command_JSON.query_object.data.value.operation_data.amount
                            }
                        }
                    }
                    let current_app_store = level_schema_config.app_data.sublevel(level_schema_config.app_root["RBAC.DD_token_RBAC.token_balances"], { valueEncoding: 'json' })
                    query_result = await upsert_using_key_value_patterns_and_JSONSchema(
                        level_schema_config.CID_store,
                        current_app_store,
                        level_schema_config.db_schema.schema["RBAC.DD_token_RBAC.token_balances"].key_value_patterns,
                        query_object.data,
                        level_schema_config.db_schema.schema["RBAC.DD_token_RBAC.token_balances"].upsert_json_schema
                    )
                    if (query_result != true) {
                        res.send({
                            "status": "ERROR",
                            "Reason": "Could not update token_balances 1",
                            "error": query_result,
                        })
                        return true
                    }
                }
                // Check the balance
                query_object = {
                    "name": "RBAC.DD_token_RBAC.token_balances",
                    "data": {
                        "variables": {
                            TOKEN_ID: command_JSON.query_object.data.value.token_ID,
                            secp256k1_PUBLIC_KEY: req.body.pubkey
                        }
                    }
                }
                try {
                    let token_balance_data = await get_query(
                        level_schema_config.dddb,
                        level_schema_config.db_schema,
                        query_object
                    )
                    console.log("token_balance_data")
                    console.log(token_balance_data)
                } catch (error) {
                    res.send({
                        "status": "ERROR",
                        "Reason": "Balance did not update",
                        "error": error,
                    })
                    return true
                    
                }
                // Update token_state
                token_state_data.token_transaction_count += 1
                token_state_data.last_transaction_timestamp_ms = command_JSON.query_object.data.value.timestamp_ms
                try {
                    console.log("I AM HERE")
                    let current_app_store = level_schema_config.app_data.sublevel(level_schema_config.app_root["RBAC.DD_token_RBAC.token_state"], { valueEncoding: 'json' })
                    let mah_result = await upsert_using_key_value_patterns_and_JSONSchema(
                        level_schema_config.CID_store,
                        current_app_store,
                        level_schema_config.db_schema.schema["RBAC.DD_token_RBAC.token_state"].key_value_patterns,
                        {
                            variables: {
                                TOKEN_ID: token_state_data.token_ID
                            },
                            value: token_state_data
                        },
                        level_schema_config.db_schema.schema["RBAC.DD_token_RBAC.token_state"].upsert_json_schema
                    )
                    if (mah_result != true) {
                        res.send({
                            "status": "ERROR",
                            "Reason": "Could not update token_state",
                            "error": mah_result,
                        })
                        return true
                    }
                    console.log("mah_result mah_result")
                    console.log(JSON.stringify(mah_result))
                } catch (error) {
                    res.send({
                        "status": "ERROR",
                        "Reason": "Could not update token_state",
                        "error": error,
                    })
                    return true
                }
                // res.send({
                //     token_ID_data: token_ID_data,
                //     token_state: token_state_data
                // })
                res.send({
                    "status": "success",
                    "Description": "Looks like we did it"
                })
                return true
            }
        }
    }
    if (command_JSON.query_object.name == "RBAC.DD_token_RBAC.transfer") {
        if (command_JSON.query_type == "upsert") {
            // Perform JSON_schema test on function data
            const ajv = new Ajv()
            const JSONSchema_validator = ajv.compile(level_schema_config.db_schema.functions['RBAC.DD_token_RBAC.mint'].JSON_schema)
            const JSONSchema_test = JSONSchema_validator(command_JSON.query_object.data.value)
            if (!JSONSchema_test) {
                res.send({
                    "status": "ERROR",
                    "Reason": "JSON_schema Test failed",
                    "data": {
                        JSON_schema: level_schema_config.db_schema.functions['RBAC.DD_token_RBAC.deploy'].JSON_schema,
                        JSON_data: command_JSON.query_object.data
                    }
                })
                return true
            }
            // Validate version
            if (command_JSON.query_object.data.value.version != "0.0.1") {
                res.send({ 
                    "status": "ERROR", 
                    "Reason": "Wrong version number, please set to 0.0.1" 
                })
                return true
            }
            // Validate app_name
            if (command_JSON.query_object.data.value.app_name != "DD_token_RBAC") {
                res.send({ 
                    "status": "ERROR", 
                    "Reason": "Please set app_name to DD_token" 
                })
                return true
            }
            // Same signing key as nostr event
            if (req.body.pubkey != await nip19.decode(command_JSON.query_object.data.value.signing_public_key).data) {
                res.send({ 
                    "status": "ERROR", 
                    "Reason": "data.signing_public_key must be the same as the address sending the nostr event" 
                })
                return true
            }
            // Check if token_ID exists and validate if it exists
            let token_ID_data = null;
            try {
                let query_object = {
                    "name": "RBAC.DD_token_RBAC.token_IDs",
                    "data": {
                        "variables": {
                            TOKEN_ID: command_JSON.query_object.data.value.token_ID
                        }
                    }
                }
                token_ID_data = await get_query(
                    level_schema_config.dddb,
                    level_schema_config.db_schema,
                    query_object
                )
                if (Object.keys(token_ID_data).length == 0 || token_ID_data == null) {
                    res.send({
                        "status": "ERROR",
                        "Reason": "Unable to find token_ID",
                        "description": `${command_JSON.query_object.data.value.token_ID}`,
                        "data": token_ID_data
                    })
                    return true
                }
            } catch (error) {
                res.send({
                    "status": "ERROR",
                    "Reason": "Unable to find token_ID",
                    "description": `${command_JSON.query_object.data.value.token_ID}`,
                    "data": token_ID_data
                })
                return true
            }
            // Get the token_state
            let token_state_data = null;
            try {
                let query_object = {
                    "name": "RBAC.DD_token_RBAC.token_state",
                    "data": {
                        "variables": {
                            TOKEN_ID: command_JSON.query_object.data.value.token_ID
                        }
                    }
                }
                token_state_data = await get_query(
                    level_schema_config.dddb,
                    level_schema_config.db_schema,
                    query_object
                )
            } catch (error) {
                res.send({
                    "status": "ERROR",
                    "Reason": "Unable to get token_state using token_ID",
                    "data": token_state_data,
                    "description": `${command_JSON.query_object.data.value.token_ID}`,
                    "error": error
                })
                return true
            }
            // Validate Timestamp
            let current_timestamp_ms = Date.now(); + (1000 * 10)
            if (
                command_JSON.query_object.data.value.datatimestamp_ms < token_state_data.last_transaction_timestamp_ms &&
                current_timestamp_ms > command_JSON.query_object.data.value.datatimestamp_ms
            ) {
                res.send({ 
                    "status": "ERROR", 
                    "HI" : "Hello",
                    "Reason": `That timestamp is not larger than ${token_state_data.last_transaction_timestamp_ms} and less than ${tcurrent_timestamp_ms}` })
                return true
            }
            // Get sender balance
            let query_object = null;
            let current_token_balence = null
            try {
                query_object = {
                    "name": "RBAC.DD_token_RBAC.token_balances",
                    "data": {
                        "variables": {
                            TOKEN_ID: command_JSON.query_object.data.value.token_ID,
                            secp256k1_PUBLIC_KEY: req.body.pubkey
                        }
                    }
                }
                current_token_balence = await get_query(
                    level_schema_config.dddb,
                    level_schema_config.db_schema,
                    query_object
                )
            } catch (error) {
                res.send({
                    "status": "ERROR",
                    "Reason": "Could not get balance",
                    "error": `${error}`,
                    "data" : query_object
                })
                return true
            }
            // Validate their ballance is sufficent
            if (current_token_balence.value < command_JSON.query_object.data.value.operation_data.amount) {
                res.send({
                    "status": "ERROR",
                    "Reason": "Insufficent Funds",
                    "error": `${error}`
                })
                return true
            }
            // Update sender balance
            try {
                query_object = {
                    "name": "RBAC.DD_token_RBAC.token_balances",
                    "data": {
                        "variables": {
                            TOKEN_ID: command_JSON.query_object.data.value.token_ID,
                            secp256k1_PUBLIC_KEY: req.body.pubkey
                        },
                        "value" : {
                            "value" : current_token_balence.value -= command_JSON.query_object.data.value.operation_data.amount
                        }
                    }
                }
                let current_app_store = level_schema_config.app_data.sublevel(level_schema_config.app_root["RBAC.DD_token_RBAC.token_balances"], { valueEncoding: 'json' })
                let query_result = await upsert_using_key_value_patterns_and_JSONSchema(
                    level_schema_config.CID_store,
                    current_app_store,
                    level_schema_config.db_schema.schema["RBAC.DD_token_RBAC.token_balances"].key_value_patterns,
                    query_object.data,
                    level_schema_config.db_schema.schema["RBAC.DD_token_RBAC.token_balances"].upsert_json_schema
                )
            } catch (error) {
                res.send({
                    "status": "ERROR",
                    "Reason": "Can't update sender balance",
                    "error": `${error}`
                })
                return true
            }
            // Get to balance
            try {
                query_object = {
                    "name": "RBAC.DD_token_RBAC.token_balances",
                    "data": {
                        "variables": {
                            TOKEN_ID: command_JSON.query_object.data.value.token_ID,
                            secp256k1_PUBLIC_KEY: req.body.pubkey
                        }
                    }
                }
                current_token_balence = await get_query(
                    level_schema_config.dddb,
                    level_schema_config.db_schema,
                    query_object
                )
            } catch (error) {
                res.send({
                    "status": "ERROR",
                    "Reason": "Could not Get Balance 2",
                    "error": `${error}`
                })
                return true
            }
            // Update Balance of who they are sending to
            try {
                query_object = {
                    "name": "RBAC.DD_token_RBAC.token_state",
                    "data": {
                        "variables": {
                            TOKEN_ID: command_JSON.query_object.data.value.token_ID,
                            secp256k1_PUBLIC_KEY: req.body.pubkey
                        }
                    }
                }
                token_state_data = await get_query(
                    level_schema_config.dddb,
                    level_schema_config.db_schema,
                    query_object
                )
                try {
                    // Update balence of who we are sending tokens to
                    query_object = {
                        "name": "RBAC.DD_token_RBAC.token_state",
                        "data": {
                            "variables": {
                                TOKEN_ID: command_JSON.query_object.data.value.token_ID,
                                secp256k1_PUBLIC_KEY: req.body.pubkey
                            },
                            "value" : {
                                "value" : command_JSON.query_object.data.value.operation_data.amount
                            }
                        }
                    }
                    let current_app_store = level_schema_config.app_data.sublevel(level_schema_config.app_root["RBAC.DD_token_RBAC.token_balances"], { valueEncoding: 'json' })
                    let query_result = await upsert_using_key_value_patterns_and_JSONSchema(
                        level_schema_config.CID_store,
                        current_app_store,
                        level_schema_config.db_schema.schema["RBAC.DD_token_RBAC.token_balances"].key_value_patterns,
                        query_object.data,
                        level_schema_config.db_schema.schema["RBAC.DD_token_RBAC.token_balances"].upsert_json_schema
                    )
                } catch (error) {
                    res.send({
                        "status": "ERROR",
                        "Reason": "Could not store updated balence in RBAC.DD_token_RBAC.token_transactions to send tokens to someone",
                        "error": `${error}`,
                    })
                    return true
                }
            } catch (error) {
                res.send({
                    "status": "ERROR",
                    "Reason": "Could not store updated balence in RBAC.DD_token_RBAC.token_transactions to send tokens to someone second time",
                    "error": `${error}`,
                })
                return true
            }
            // Update someone elses balence
            try {
                query_object = {
                    "name": "RBAC.DD_token_RBAC.token_balances",
                    "data": {
                        "variables": {
                            TOKEN_ID: command_JSON.query_object.data.value.token_ID,
                            secp256k1_PUBLIC_KEY: command_JSON.query_object.data.value.operation_data.to_public_key
                        }
                    }
                }
                token_state_data = await get_query(
                    level_schema_config.dddb,
                    level_schema_config.db_schema,
                    query_object
                )
                query_object = {
                    "name": "RBAC.DD_token_RBAC.token_balances",
                    "data": {
                        "variables": {
                            TOKEN_ID: command_JSON.query_object.data.value.token_ID,
                            secp256k1_PUBLIC_KEY: req.body.pubkey
                        },
                        "values": {
                            "value": command_JSON.query_object.data.value.operation_data.amount
                        }
                    }
                }
                let current_app_store = level_schema_config.app_data.sublevel(level_schema_config.app_root["RBAC.DD_token_RBAC.token_balances"], { valueEncoding: 'json' })
                query_result = await upsert_using_key_value_patterns_and_JSONSchema(
                    level_schema_config.CID_store,
                    current_app_store,
                    level_schema_config.db_schema.schema["RBAC.DD_token_RBAC.token_balances"].key_value_patterns,
                    query_object.data,
                    level_schema_config.db_schema.schema["RBAC.DD_token_RBAC.token_balances"].upsert_json_schema
                )
                if (query_result != true) {
                    res.send({
                        "status": "ERROR",
                        "Reason": " 2",
                        "error": mah_result,
                    })
                    return true
                }
            } catch (error) {
                try {
                    query_object = {
                        "name": "RBAC.DD_token_RBAC.token_balances",
                        "data": {
                            "variables": {
                                TOKEN_ID: command_JSON.query_object.data.value.token_ID,
                                secp256k1_PUBLIC_KEY: req.body.pubkey
                            },
                            "value": {
                                "value": command_JSON.query_object.data.value.operation_data.amount
                            }
                        }
                    }
                    let current_app_store = level_schema_config.app_data.sublevel(level_schema_config.app_root["RBAC.DD_token_RBAC.token_balances"], { valueEncoding: 'json' })
                    let query_result = await upsert_using_key_value_patterns_and_JSONSchema(
                        level_schema_config.CID_store,
                        current_app_store,
                        level_schema_config.db_schema.schema["RBAC.DD_token_RBAC.token_balances"].key_value_patterns,
                        query_object.data,
                        level_schema_config.db_schema.schema["RBAC.DD_token_RBAC.token_balances"].upsert_json_schema
                    )
                    if (query_result != true) {
                        res.send({
                            "status": "ERROR",
                            "Reason": "Could not update token_balances 3",
                            "error": query_result,
                        })
                        return true
                    }
                } catch (error) {
                    res.send({
                        "status": "ERROR",
                        "Reason": "Could not store updated balence in RBAC.DD_token_RBAC.token_transactions for the reciever",
                        "error": `${error}`,
                    })
                    return true
                }
            }
            // FIX ABOVE









            // Store Transactions
            let query_result = null;
            let tmp_input_data = null;
            try {
                console.log("token_state_data.token_transaction_count")
                console.log(token_state_data.token_transaction_count)
                console.log(command_JSON.query_object.data.value.token_ID)
                console.log(req.body.pubkey)
                console.log(token_state_data.token_transaction_count)
                tmp_input_data = {
                    "variables": {
                        "TOKEN_ID": command_JSON.query_object.data.value.token_ID,
                        "TOKEN_TRANSACTION_NUM": token_state_data.token_transaction_count,
                        "secp256k1_PUBLIC_KEY": req.body.pubkey
                    },
                    "value": {
                        "token_ID": command_JSON.query_object.data.value.token_ID,
                        "token_transaction_count": token_state_data.token_transaction_count,
                        "last_transaction_timestamp_ms": command_JSON.query_object.data.value.timestamp_ms

                    }
                }
                console.log("tmp_input_data")
                console.log(tmp_input_data)
                let current_app_store = level_schema_config.app_data.sublevel(level_schema_config.app_root["RBAC.DD_token_RBAC.token_transactions"], { valueEncoding: 'json' })
                query_result = await upsert_using_key_value_patterns_and_JSONSchema(
                    level_schema_config.CID_store,
                    current_app_store,
                    level_schema_config.db_schema.schema["RBAC.DD_token_RBAC.token_transactions"].key_value_patterns,
                    tmp_input_data,
                    level_schema_config.db_schema.schema["RBAC.DD_token_RBAC.token_state"].upsert_json_schema
                )
            } catch (error) {
                res.send({
                    "status": "ERROR",
                    "Reason": "Could not store transaction",
                    "error": `${error}`,
                    "data": `${JSON.stringify(tmp_input_data)}`
                })
                return true
            }
            // Update token_state
            token_state_data.token_transaction_count += 1
            token_state_data.last_transaction_timestamp_ms = command_JSON.query_object.data.value.timestamp_ms
            try {
                console.log("I AM HERE")
                let current_app_store = level_schema_config.app_data.sublevel(level_schema_config.app_root["RBAC.DD_token_RBAC.token_state"], { valueEncoding: 'json' })
                let mah_result = await upsert_using_key_value_patterns_and_JSONSchema(
                    level_schema_config.CID_store,
                    current_app_store,
                    level_schema_config.db_schema.schema["RBAC.DD_token_RBAC.token_state"].key_value_patterns,
                    {
                        variables: {
                            TOKEN_ID: token_state_data.token_ID
                        },
                        value: token_state_data
                    },
                    level_schema_config.db_schema.schema["RBAC.DD_token_RBAC.token_state"].upsert_json_schema
                )
                if (mah_result != true) {
                    res.send({
                        "status": "ERROR",
                        "Reason": "Could not update token_state",
                        "error": mah_result,
                    })
                    return true
                }
                console.log("mah_result mah_result")
                console.log(JSON.stringify(mah_result))
            } catch (error) {
                res.send({
                    "status": "ERROR",
                    "Reason": "Could not update token_state",
                    "error": error,
                })
                return true
            }
        }
    }


    try {
        res.send({ status: "ERROR" })
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

app.post('/get_balance', async function (req, res) {
    // Check if coupon code if valid and what domains it supports
    // Claim coupon code


    console.log("\n\n")
    console.log("Request to /get_balance")
    console.log(req.body)
    try {
        let mah_CID = await get_query(
            level_schema_config.dddb,
            level_schema_config.db_schema,
            req.body
        )
        res.send(mah_CID)
        return true
    } catch (error) {
        console.log(error)
        res.send({
            "status" : "error",
            "description" : "Could not resolve query",
            "error" : error
        })
        return true
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