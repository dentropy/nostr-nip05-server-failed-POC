import { Level } from 'level';
import { level_schema } from "../database/levelSchema.js";
import { get_index, get_query  } from "../database/db.js";
import { upsert_using_key_value_patterns_and_JSONSchema } from '../database/queryLogic.js';
import * as nip19 from 'nostr-tools/nip19';

export async function setup(level_path, process){
    
    // console.log("level_path")
    // console.log(level_path)
    console.log("NOSTR_ADMIN_PUBLIC_KEY")
    console.log(process.env.NOSTR_ADMIN_PUBLIC_KEY)
    // level_db = new Level(level_path, { valueEncoding: 'json' })
    // dddb = level_db.sublevel('ddaemon', { valueEncoding: 'json' })
    // CID_store = dddb.sublevel('CID_store', { valueEncoding: 'json' })
    // db_schema = await level_schema(dddb)
    // // Check for Nostr public key to put in admin_t table

    // root_IPNS = await dddb.get('root')
    // app_data =  dddb.sublevel('app_data', { valueEncoding: 'json' })
    // root_app_data_IPNS = app_data.sublevel(root_IPNS, { valueEncoding: 'json' })
    // app_root_CID = await root_app_data_IPNS.get("root")
    // app_root = await CID_store.get(app_root_CID["/"])
    // app_key = root_IPNS

    let level_schema_config = {}
    level_schema_config.level_db = new Level(level_path + "level_schema_config", { valueEncoding: 'json' })
    level_schema_config.dddb = level_schema_config.level_db.sublevel('ddaemon', { valueEncoding: 'json' })
    level_schema_config.CID_store = level_schema_config.dddb.sublevel('CID_store', { valueEncoding: 'json' })
    level_schema_config.db_schema = await level_schema(level_schema_config.dddb)
    level_schema_config.root_IPNS = await level_schema_config.dddb.get('root')
    level_schema_config.app_data =  level_schema_config.dddb.sublevel('app_data', { valueEncoding: 'json' })
    level_schema_config.root_app_data_IPNS = level_schema_config.app_data.sublevel(level_schema_config.root_IPNS, { valueEncoding: 'json' })
    level_schema_config.app_root_CID = await level_schema_config.root_app_data_IPNS.get("root")
    level_schema_config.app_root = await level_schema_config.CID_store.get(level_schema_config.app_root_CID["/"])
    level_schema_config.app_key = level_schema_config.root_IPNS


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
            console.log("rules_list")
            let rules_list = await get_index(level_schema_config.dddb, "RBAC.root_RBAC.app_rules", "rule_name_")
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
                // await upsert_query(dddb, db_schema, query_object)
                var current_DD_index = level_schema_config.app_data.sublevel(level_schema_config.app_root[query_object.name], { valueEncoding: 'json' })
                await upsert_using_key_value_patterns_and_JSONSchema(
                    level_schema_config.CID_store,
                    current_DD_index,
                    level_schema_config.db_schema.schema[query_object.name].key_value_patterns,
                    query_object.data,
                    level_schema_config.db_schema.schema[query_object.name].upsert_json_schema
                )

                var query_object = {
                    "name" : "RBAC.root_RBAC.auth_apps",
                    "data" : {
                        "variables" : {
                            AUTH_APP_NAME : "secp256k1_key"
                        },
                        "value": {
                            "enabled": true
                        }
                    }
                }
                // await upsert_query(dddb, db_schema, query_object)
                var current_DD_index = app_data.sublevel(level_schema_config.app_root[query_object.name], { valueEncoding: 'json' })
                await upsert_using_key_value_patterns_and_JSONSchema(
                    level_schema_config.CID_store,
                    current_DD_index,
                    level_schema_config.db_schema.schema[query_object.name].key_value_patterns,
                    query_object.data,
                    level_schema_config.db_schema.schema[query_object.name].upsert_json_schema
                )
                var query_object = {
                    "name" : "RBAC.root_RBAC.app_rule_auth",
                    "data" : {
                        "variables" : {
                            APP_RULE : "root",
                            AUTH_APP_NAME : "secp256k1_key"
                        },
                        "value": {
                            "enabled": true
                        }
                    }
                }
                //await upsert_query(dddb, db_schema, query_object)
                var current_DD_index = level_schema_config.app_data.sublevel(level_schema_config.app_root[query_object.name], { valueEncoding: 'json' })
                await upsert_using_key_value_patterns_and_JSONSchema(
                    level_schema_config.CID_store,
                    current_DD_index,
                    level_schema_config.db_schema.schema[query_object.name].key_value_patterns,
                    query_object.data,
                    level_schema_config.db_schema.schema[query_object.name].upsert_json_schema
                )

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
                // await upsert_query(dddb, db_schema, query_object)
                var current_DD_index = level_schema_config.app_data.sublevel(level_schema_config.app_root[query_object.name], { valueEncoding: 'json' })
                await upsert_using_key_value_patterns_and_JSONSchema(
                    level_schema_config.CID_store,
                    current_DD_index,
                    level_schema_config.db_schema.schema[query_object.name].key_value_patterns,
                    query_object.data,
                    level_schema_config.db_schema.schema[query_object.name].upsert_json_schema
                )

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
            // await upsert_query(dddb, db_schema, query_object)
            var current_DD_index = level_schema_config.app_data.sublevel(level_schema_config.app_root[query_object.name], { valueEncoding: 'json' })
            await upsert_using_key_value_patterns_and_JSONSchema(
                level_schema_config.CID_store,
                current_DD_index,
                level_schema_config.db_schema.schema[query_object.name].key_value_patterns,
                query_object.data,
                level_schema_config.db_schema.schema[query_object.name].upsert_json_schema
            )


            var query_object = {
                "name" : "RBAC.root_RBAC.app_rules",
                "data" : {
                    "variables" : {
                        APP_RULE : "nip05_user"
                    },
                    "value": {
                      "enabled": true
                    }
                }
            }
            // await upsert_query(dddb, db_schema, query_object)
            var current_DD_index = level_schema_config.app_data.sublevel(level_schema_config.app_root[query_object.name], { valueEncoding: 'json' })
            await upsert_using_key_value_patterns_and_JSONSchema(
                level_schema_config.CID_store,
                current_DD_index,
                level_schema_config.db_schema.schema[query_object.name].key_value_patterns,
                query_object.data,
                level_schema_config.db_schema.schema[query_object.name].upsert_json_schema
            )
        } catch (error) {
            console.log(`\nInvalid npub key stored in $NOSTR_ADMIN_PUBLIC_KEY environment variable\n${process.env.NOSTR_ADMIN_PUBLIC_KEY}\n${error}`)
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
    level_schema_config.app_key = await level_schema_config.dddb.get("root")

    return level_schema_config
}