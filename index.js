import express from 'express';
import { Level } from 'level';
import { level_schema } from "./database/levelSchema.js";
import { get_index, get_query, upsert_query } from "./database/db.js";
import { upsert_using_key_value_patterns_and_JSONSchema } from './database/queryLogic.js';
// Nostr specific imports
import * as nip19 from 'nostr-tools/nip19';
import { generateSecretKey, getPublicKey } from 'nostr-tools/pure';
import { finalizeEvent, verifyEvent } from 'nostr-tools'
// import dotenv from 'dotenv';
// let dotenv_config = dotenv.config()

var app = express();
app.use(express.urlencoded({extended: true}));
app.use(express.json()) 

const level_db = new Level('./database/db.leveldb', { valueEncoding: 'json' })
const dddb = level_db.sublevel('ddaemon', { valueEncoding: 'json' })
let db_schema = null;
let app_key = null;
let app_data = null;
let CID_store = null;
async function setup(dddb){
    db_schema = await level_schema(dddb)
    // Check for Nostr public key to put in admin_t table

    // Troubleshooting Code
    // console.log(process.env)
    // console.log( JSON.stringify(Object.keys(process.env), null, 2 ))
    // console.log(process.env.NOSTR_ADMIN_PUBLIC_KEY)
    // console.log(`process.env.NOSTR_ADMIN_PUBLIC_KEY = ${process.env.NOSTR_ADMIN_PUBLIC_KEY}`)
    if(process.env.NOSTR_ADMIN_PUBLIC_KEY == undefined || process.env.NOSTR_ADMIN_PUBLIC_KEY == ''){
        console.log("\nPlease set environment variable NOSTR_ADMIN_PUBLIC_KEY to a nostr public key")
        process.exit(1);
    }
    if(process.env.NOSTR_ADMIN_PUBLIC_KEY.slice(0, 4) == 'nsec'){
        console.log("\nBro that is your private key let's not do that, get npub not nsec")
        process.exit(1);
    }
    if(process.env.NOSTR_ADMIN_PUBLIC_KEY.slice(0, 4) == 'npub'){
        let nostr_public_key = await nip19.decode(process.env.NOSTR_ADMIN_PUBLIC_KEY).data
        try {
            let rules_list = await get_index(dddb, "RBAC.root_RBAC.app_rules", "rule_name_")
            console.log(rules_list)
            console.log("rules_list")
            if (rules_list.length == 0){
                var query_object = {
                    "name" : "RBAC.root_RBAC.app_rules",
                    "data" : {
                        "variables" : {
                            APP_RULE : "root"
                        },
                        "value": {
                          "enabled": true
                        }
                    }
                }
                await upsert_query(dddb, db_schema, query_object)
                var query_object = {
                    "name" : "RBAC.root_RBAC.auth_apps",
                    "data" : {
                        "variables" : {
                            AUTH_APP_NAME : "secp256k1"
                        },
                        "value": {
                            "enabled": true
                        }
                    }
                }
                await upsert_query(dddb, db_schema, query_object)
                var query_object = {
                    "name" : "RBAC.root_RBAC.app_rule_auth",
                    "data" : {
                        "variables" : {
                            APP_RULE : "root",
                            AUTH_APP_NAME : "secp256k1"
                        },
                        "value": {
                            "enabled": true
                        }
                    }
                }
                await upsert_query(dddb, db_schema, query_object)
                var query_object = {
                    "name" : "RBAC.root_RBAC.secp256k1_auth_app",
                    "data" : {
                        "variables" : {
                            APP_RULE : "root",
                            secp256k1_PUBLIC_KEY : nostr_public_key.toLowerCase()
                        },
                        "value": {
                            "enabled": true
                        }
                    }
                }
                await upsert_query(dddb, db_schema, query_object)
            }
            var query_object = {
                "name" : "RBAC.root_RBAC.secp256k1_auth_app",
                "data" : {
                    "variables" : {
                        APP_RULE : "root",
                        secp256k1_PUBLIC_KEY : nostr_public_key.toLowerCase()
                    },
                    "value": {
                        "enabled": true,
                        secp256k1_PUBLIC_KEY : nostr_public_key.toLowerCase()
                    }
                }
            }
            await upsert_query(dddb, db_schema, query_object)
        } catch (error) {
            console.log("\nInvalid npub key stored in $NOSTR_ADMIN_PUBLIC_KEY environment variable")
            process.exit(1);
        }
    }
    console.log(`NOSTR_ADMIN_PUBLIC_KEY = ${process.env.NOSTR_ADMIN_PUBLIC_KEY}`)


    if(process.env.NOSTR_DNS_NAME == undefined || process.env.NOSTR_DNS_NAME == ''){
        console.log("\nEnvironment Variable $NOSTR_DNS_NAME not set, you can set this up later via the API, see docs")
    }
    else {
        let dns_name = process.env.NOSTR_DNS_NAME.toLowerCase();
        console.log(`dns_name = ${dns_name}`)
        // #TODO
    }
    let app_key = await dddb.get("root")

}
setup(dddb)

app.get('/', (req, res) => {
    res.send("Hello, World! This is a GET request. <a href='/.well-known/nostr.json'>Well Known</a>");
});


app.get('/.well-known/nostr.json', async (req, res) => {
    const CID_store = dddb.sublevel('CID_store', { valueEncoding: 'json' })
    let get_nostr_dot_json = await get_index(
        dddb, 
        "nostr_json", 
        `nostr_`
    )
    get_nostr_dot_json = await CID_store.get(get_nostr_dot_json[Object.keys(get_nostr_dot_json)[0]]["/"])
    res.json( get_nostr_dot_json);
});

app.get("/appnames", async function (req, res) {
    res.json({
        app_name : db_schema.app_names,
        app_key  : await dddb.get("root")
    })
})

app.post("/napi", async function (req, res) {
    const CID_store = dddb.sublevel('CID_store', { valueEncoding: 'json' })
    let root_IPNS = await dddb.get('root')
    const app_data =  dddb.sublevel('app_data', { valueEncoding: 'json' })
    const root_app_data_IPNS = app_data.sublevel(root_IPNS, { valueEncoding: 'json' })
    const app_root_CID = await root_app_data_IPNS.get("root")
    let app_root = await CID_store.get(app_root_CID["/"])

    // Validate the message is signed
    let event_is_verified = await verifyEvent(req.body)
    if(!event_is_verified){
        res.send({"error" : "event could not be verified"})
        return false
    }
    let command_JSON = JSON.parse(req.body.content)
    console.log(req.body.tags[0])
    if (req.body.tags[0][0] != 'DD'){
        res.send({"error" : "event missing tag 'DD'"})
        return false
    }
    // Validate app_name
    if (!db_schema.app_names.includes(command_JSON.app_name)){
        res.send({"error" : "Invalid app_name please check GET /appnames"})
        return false
    }
    // Validate app_key
    let app_key = await dddb.get("root")
    if (app_key != command_JSON.app_key){
        res.send({"error" : "Invalid app_key please check GET /appnames"})
        return false
    }
    // Validate the query name
    if( !Object.keys(app_root).includes(command_JSON.query_object.name)){
        res.send({"error" : `App ${command_JSON.query_object.name} not corectly installed \n
            ${JSON.stringify(app_root)}`})
        return false
    }
    // Reverse lookup the users roles
    let query_roles = await get_index(
        dddb, 
        "RBAC.root_RBAC.secp256k1_auth_app", 
        `spec_${req.body.pubkey}_app_rule_`
    )
    let roles = []
    for (const tmp_role of Object.keys(query_roles)){
        if(tmp_role.includes(String(req.body.pubkey))){
            let test_enabled = await CID_store.get(query_roles[tmp_role]["/"])
            if(test_enabled.enabled == true){
                roles.push( tmp_role.slice(`spec_${req.body.pubkey}_app_rule_`.length) )
            }
        }
    }
    if(command_JSON.query_object.name == "apps.nostr_NIP05_relay_map.NIP05_internet_identifier"){
        if(command_JSON.query_type == "upsert"){
            if(roles.includes("root")){
                console.log("Object.keys")
                console.log(db_schema)
                console.log(db_schema.schema['apps.nostr_NIP05_relay_map.NIP05_internet_identifier'])
                let current_app_store = app_data.sublevel( app_root["apps.nostr_NIP05_relay_map.NIP05_internet_identifier"], { valueEncoding: 'json' }) 
                let query_result = await upsert_using_key_value_patterns_and_JSONSchema(
                    CID_store,
                    current_app_store,
                    db_schema.schema['apps.nostr_NIP05_relay_map.NIP05_internet_identifier'].key_value_patterns,
                    command_JSON.query_object.data,
                    db_schema.schema['apps.nostr_NIP05_relay_map.NIP05_internet_identifier'].upsert_json_schema)
                // Pull out the domain name
                let tmp_domain_name = command_JSON.query_object.data.variables.DNS_NAME
                // Grab all records

                let NIP05_index = await get_index(dddb, 'apps.nostr_NIP05_relay_map.NIP05_internet_identifier', "nip05_dns_first_")
                // Create nostr.json
                // Get domain name
                console.log("NIP05_index")
                console.log(NIP05_index)
                let nostr_dot_json = {
                    "names" : {},
                    "relays" : {}
                }
                for(const nip05_dns of Object.keys(NIP05_index)){
                    if(nip05_dns.includes("nip05_dns_first_")){
                        let CID_data = await CID_store.get( NIP05_index[nip05_dns]["/"])
                        console.log(CID_data)
                        nostr_dot_json.names[CID_data.NOSTR_NAME_LOCAL_PART] = JSON.parse(JSON.stringify(CID_data.NOSTR_PUBLIC_KEY))
                        nostr_dot_json.relays[CID_data.NOSTR_PUBLIC_KEY] = JSON.parse(JSON.stringify(CID_data.relays))
                    }
                }
                console.log("nostr_dot_json")
                console.log(nostr_dot_json)
                console.log(JSON.stringify(nostr_dot_json, null, 2))
                // Get all accounts with domain name
                // Save to nostr_json

                current_app_store = app_data.sublevel( app_root["nostr_json"], { valueEncoding: 'json' }) 
                query_result = await upsert_using_key_value_patterns_and_JSONSchema(
                    CID_store,
                    current_app_store,
                    db_schema.schema["nostr_json"].key_value_patterns,
                    {
                        variables : {
                            DNS_NAME : tmp_domain_name
                        },
                        value : nostr_dot_json
                    },
                    db_schema.schema["nostr_json"].upsert_json_schema
                    )
                if(query_result == true){
                    res.send({"status" : "success", "description" : "upsert_query on index apps.nostr_NIP05_relay_map.nostr_public_key SUCCESS"})
                    return true
                } else {
                    res.send({"status" : "error", "description" : "upsert_query on index apps.nostr_NIP05_relay_map.nostr_public_key failed", "data" : query_result})
                    return true
                }
            } else {
                if(roles.includes("secp256k1_key") ){ // && req.body.pubkey == 
                    // Check if public key is in database for a domain
                    // Check the DNS name they are trying to update
                    // Perform the update
                }
            }
        }
    }
    // Validate the user has the correct roles to run the query
        // I guess I can just put the roles in the app itself
    
    // Run the query
    // Return the results

    try {
        // Actually do or calculate something
        console.log(req.body)
        res.send(req.body)
    } catch (err){
      res.send(err)
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
    } catch (err){
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
    } catch (err){
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
    } catch (err){
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
    } catch (err){
      res.send(err)
    }
})

var server = app.listen(8081, function () {
    var host = server.address().address
    var port = server.address().port
    console.log("\n\nExample app listening at http://%s:%s", host, port)
 })