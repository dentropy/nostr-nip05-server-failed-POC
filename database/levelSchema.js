
import { Level } from 'level';
import ipns from 'ed25519-keygen/ipns';
import { randomBytes } from 'ed25519-keygen/utils';
import fs from 'fs';

import { encode, decode } from '@ipld/dag-json'
import { CID } from 'multiformats'
import { sha256 } from 'multiformats/hashes/sha2'

import { code } from 'multiformats/codecs/json'

const db = new Level('./database/db.leveldb', { valueEncoding: 'json' })

// Check if app directory for apps

async function main(){
    const dddb = db.sublevel('ddaemon', { valueEncoding: 'json' })
    try {
        const value = await dddb.get('root')
        console.log("\ndddb.get('root')")
        console.log(value)
        console.log("Validating data now")
        console.log(await validate_schema(dddb))
    } catch (error) {
        console.log("\n\n")
        console.log("error.status")
        console.log(error.status)
        initialize_app_data(dddb)
    }
}

async function generate_and_store_IPNS_keys(pki_store){
    const iseed = randomBytes(32);
    const ikeys = await ipns(iseed);
    var value_to_encode = {
        privateKey : ikeys.privateKey,
        publicKey  : ikeys.publicKey
    }
    await pki_store.put(`public_key_${ikeys.base32}`, value_to_encode)
    console.log(`CREATING IPNS NAME ${ikeys.base32}`)
    return ikeys.base32
}

// async function configure_app(PKI_db, app_data_db, CID_db, db_schema, schema_prefix){
//     for (const schema_sublevel_name of Object.keys(db_schema.schema) ) {
//         const iseed = await randomBytes(32);
//         const ikeys = await ipns(iseed);
//         var value_to_encode = {
//             privateKey : await ikeys.privateKey,
//             publicKey  : await ikeys.publicKey
//         }
//         var cid_value = await CID.create(1, code, await sha256.digest(await encode(value_to_encode)))
//         await CID_db.put(cid_value, value_to_encode)
//         schema_ipns_lookup[schema_prefix + schema_sublevel_name] = await ikeys.base32
//         await PKI_db.put(await ikeys.publicKey, cid_value)
//         var current_sublevel = app_data_db.sublevel("app_" + ikeys.base32, { valueEncoding: 'json' })
//         for ( const default_key_to_load of Object.keys(db_schema.schema[schema_sublevel_name].load_defaults) ) {
//             var value_to_encode = db_schema.schema[schema_sublevel_name].load_defaults[default_key_to_load]
//             var cid_value = CID.create(1, code, await sha256.digest(encode(value_to_encode)))
//             await CID_db.put(cid_value, value_to_encode)
//             await current_sublevel.put(default_key_to_load, value_to_encode)
//         }
//     }
//     return schema_ipns_lookup
// }


// Install app
// Create IPNS name
// Save it to root PKI
// Register app in apps
// Create app-data directory for `nostr-nip05-server.dentropy@ddaemon.org`
    // Create pki directory for this app
    // Create apps directory for this app, register is as no dependencies
    // create app-data directory for this app
    // Create a ipns name for each dd_index, saving them in the pki, also registering them in the root app-data index
    // Load all default data
async function initialize_app_data(dddb){

    await dddb.put('root', {
        initialized : true,
        app_ipns_lookup : {}
    })
    

    // Store it in pki
    const PKI_store = dddb.sublevel('PKI', { valueEncoding: 'json' })
    const CID_store = dddb.sublevel('CID_store', { valueEncoding: 'json' })
        
    // Configure app data directory
    const app_data =  dddb.sublevel('app_data', { valueEncoding: 'json' })


    // Load in all the schemas even from dependencies
    let db_schema = JSON.parse(await fs.readFileSync('./database/levelSchema.json'))
    let schema_ipns_lookup = {}
    for (const DD_dependency of db_schema.dependencies){
        let levelSchema = await JSON.parse( fs.readFileSync( "./database/" + DD_dependency.name.split('.').join('/') + "/levelSchema.json" ) )
        for (const DD_index of Object.keys(levelSchema.schema) ){
            db_schema.schema[DD_dependency.name + "." + DD_index] = levelSchema.schema[DD_index]
        }
    }


    // Generate all the Schema IPNS names and load in the default values
    for (const DD_index of Object.keys(db_schema.schema)){
        schema_ipns_lookup[DD_index] = await generate_and_store_IPNS_keys(PKI_store)
        // Load in default values

        // console.log("\n\n")
        // console.log("DD_index")
        // console.log(DD_index)

        // console.log("\n\n")
        // console.log("db_schema.schema[DD_index]")
        // console.log(db_schema.schema[DD_index])


        // console.log("\n\n")
        // console.log("Object.keys( db_schema.schema[DD_index] )")
        // console.log(Object.keys( db_schema.schema[DD_index] ) )


        // console.log("\n\n")
        // console.log("Object.keys( db_schema.schema[DD_index].load_defaults )")
        // console.log(Object.keys( db_schema.schema[DD_index].load_defaults ) )


        if(  !Object.keys(db_schema.schema[DD_index]).includes("load_defaults") ){
            continue;
        }
        for(const DD_default_value of Object.keys(db_schema.schema[DD_index].load_defaults)){
            schema_ipns_lookup[DD_default_value] = await generate_and_store_IPNS_keys(PKI_store)
            const current_app_data_dir = await app_data.sublevel(schema_ipns_lookup[DD_default_value], { valueEncoding: 'json' })
            let value_to_encode = db_schema.schema[DD_index].load_defaults[[DD_default_value]]
            var cid_value = CID.create(1, code, await sha256.digest(encode(   value_to_encode   )))
            await CID_store.put(cid_value, value_to_encode)
            await current_app_data_dir.put(DD_default_value, cid_value)
        }
    }

    // Store schema_ipns_lookup
    let apps_root = await dddb.get('root')
    apps_root.app_ipns_lookup[db_schema.app_names[0]] = await generate_and_store_IPNS_keys(PKI_store, CID_store)
    var cid_value = await CID.create(1, code, await sha256.digest(encode(schema_ipns_lookup)))
    await CID_store.put(cid_value, schema_ipns_lookup)
    await dddb.put('root', cid_value)


    const root_app_data = await app_data.sublevel(apps_root.app_ipns_lookup[db_schema.app_names[0]] , { valueEncoding: 'json' })
    var cid_value = await CID.create(1, code, await sha256.digest(encode(schema_ipns_lookup)))
    await CID_store.put(cid_value, schema_ipns_lookup)
    root_app_data.put("config", cid_value)
}

async function validate_schema(dddb){
    // Check if app is installed
        // Check if app name is in there
        // get ipns name of the app
    // Check if IPNS name is in pki
    // Get the root of the application with its ipns names
    // Check if we control all those IPNS names
    // Check the default values of the application
}


// Load data for app to boot
    // admin nostr key
    // dns name


main()