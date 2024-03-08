
import { Level } from 'level';

// Open the LevelDB database
const db = new Level('./database/db.leveldb', { valueEncoding: 'json' })
const dddb = db.sublevel('ddaemon', { valueEncoding: 'json' })
const apps = dddb.sublevel('apps', { valueEncoding: 'json' })
const pki = dddb.sublevel('pki', { valueEncoding: 'json' })
const cid_store = dddb.sublevel('CID_store', { valueEncoding: 'json' })
const raw_app_data =  dddb.sublevel('app_data', { valueEncoding: 'json' })
// const app_data = raw_app_data.sublevel('app_' + ikeys.base32.slice(7), { valueEncoding: 'json' })
const my_db = dddb;


// Function to iterate through the database
for await (const [key, value] of my_db.iterator()) {
    let nd_json = {
      key  : key,
      value: value
    }
    console.log(JSON.stringify(nd_json))
  }



const db_object = {
    db : db,
    dddb : dddb,
    apps : apps,
    pki : pki,
    cid_store : cid_store,
    raw_app_data :  raw_app_data
}

// for await (const db_select of Object.keys(db_object)){
//     console.log("\n\n\n\n")
//     console.log(`DB Select = ${db_select}`)
//     for await (const [key, value] of db_object[db_select].iterator()) {
//         console.log(`\nKey  : ${key}`)
//         console.log(`Value: ${JSON.stringify(value,null, 2)}`)
//       }
// }
