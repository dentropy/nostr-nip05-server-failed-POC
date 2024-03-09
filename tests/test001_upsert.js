import { Level } from 'level';
import { level_schema } from "../database/levelSchema.js";
// import { upsert_query } from "../database/db.js";
import { upsert_using_key_value_patterns_and_JSONSchema } from "../database/queryLogic.js"


async function main(){
    const level_db = new Level('./database/db.leveldb', { valueEncoding: 'json' })
    const dddb = level_db.sublevel('ddaemon', { valueEncoding: 'json' })
    const CID_store = dddb.sublevel('CID_store', { valueEncoding: 'json' })
    let root_IPNS = await dddb.get('root')
    const app_data =  dddb.sublevel('app_data', { valueEncoding: 'json' })
    const root_app_data_IPNS = app_data.sublevel(root_IPNS, { valueEncoding: 'json' })
    const app_root_CID = await root_app_data_IPNS.get("root")
    let app_root = await CID_store.get(app_root_CID["/"])
    let db_schema = await level_schema(dddb)
    // console.log("db_schema")
    // console.log(JSON.stringify(db_schema, null, 2))
    
    // let query_object = {
    //     "name" : "apps.nostr_NIP05_relay_map.dns_names",
    //     "data" : {
    //         "variables" : {
    //             DNS_NAME : "example.tld"
    //         },
    //         "value": {
    //           "DNS_NAME": "example.TLD",
    //           "status": true
    //         }
    //     }
    // }
    // let query_result = await upsert_query(dddb, db_schema, query_object)

    let query_object = {
        "name" : "apps.nostr_NIP05_relay_map.dns_names",
        "data" : {
            "variables" : {
                DNS_NAME : "example.tld"
            },
            "value": {
              "status": true
            }
        }
    }

    console.log("\napp_root[query_object.name]")
    console.log(app_root[query_object.name])
    console.log("\nquery_object.name")
    console.log(query_object.name)
    console.log("\ndb_schema[query_object.name]")
    console.log(db_schema.schema[query_object.name])
    let current_DD_index = app_data.sublevel(app_root[query_object.name], { valueEncoding: 'json' })
    let query_result = null;
    try {
        query_result = await upsert_using_key_value_patterns_and_JSONSchema(
            CID_store,
            current_DD_index,
            db_schema.schema[query_object.name].key_value_patterns,
            query_object.data,
            db_schema.schema[query_object.name].upsert_json_schema
        )
    } catch (error) {
        console.log("ERROR: Problem with upsert_using_key_value_patterns_and_JSONSchema")
    }

    console.log("query_result")
    console.log(query_result)
}

main()