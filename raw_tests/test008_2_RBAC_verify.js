import { Level } from 'level';
import { level_schema } from "../database/levelSchema.js";
import { get_index } from "../database/db.js";



async function main(){
    const level_db = new Level('./database/db.leveldb', { valueEncoding: 'json' })
    const dddb = level_db.sublevel('ddaemon', { valueEncoding: 'json' })
    let db_schema = await level_schema(dddb)
    const CID_store = dddb.sublevel('CID_store', { valueEncoding: 'json' })
    // console.log("db_schema")
    // console.log(JSON.stringify(db_schema, null, 2))
    

    //let query_result = await get_index(dddb, "apps.nostr_NIP05_relay_map.dns_names", "dns_name_")


    let query_result = await get_index(
        dddb, 
        "RBAC.root_RBAC.secp256k1_auth_app", 
        "spec_"
    )
    let CID_result = await CID_store.get(query_result[Object.keys(query_result)[0]]["/"])

    console.log("query_result")
    console.log(query_result)
    console.log("CID_result")
    console.log(CID_result)
}

main()