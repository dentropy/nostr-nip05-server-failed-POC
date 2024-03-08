import { Level } from 'level';
import { level_schema } from "../database/levelSchema.js";
import { upsert_query } from "../database/db.js";



async function main(){
    const level_db = new Level('./database/db.leveldb', { valueEncoding: 'json' })
    const dddb = level_db.sublevel('ddaemon', { valueEncoding: 'json' })
    let db_schema = await level_schema(dddb)
    // console.log("db_schema")
    // console.log(JSON.stringify(db_schema, null, 2))
    
    let query_object = {
        "name" : "apps.nostr_NIP05_relay_map.NIP05_internet_identifier",
        "data" : {
            "variables" : {
                NOSTR_NAME_LOCAL_PART : "Bob",
                DNS_NAME : "example.tld"
            },
            "value": {
              "status": true
            }
        }
    }
    let query_result = await upsert_query(dddb, db_schema, query_object)

    console.log("query_result")
    console.log(query_result)
}

main()