import { Level } from 'level';
import { level_schema } from "./database/levelSchema.js";
import { run_query } from "./database/db.js";



async function main(){
    const level_db = new Level('./database/db.leveldb', { valueEncoding: 'json' })
    const dddb = level_db.sublevel('ddaemon', { valueEncoding: 'json' })
    let db_schema = await level_schema(dddb)
    // console.log("db_schema")
    // console.log(JSON.stringify(db_schema, null, 2))
    
    let query_object = {
        "name" : "apps.nostr_NIP05_relay_map.dns_names",
        "data" : {
            "variables" : {
                DNS_NAME : "example.tld"
            },
            "value": {
              "DNS_NAME": "example.TLD",
              "status": true
            }
        }
    }
    let query_result = await run_query(dddb, db_schema, query_object)

    console.log("query_result")
    console.log(query_result)
}

main()