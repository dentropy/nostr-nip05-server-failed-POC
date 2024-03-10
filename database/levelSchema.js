
import { Level } from 'level';
import ipns from 'ed25519-keygen/ipns';
import { randomBytes } from 'ed25519-keygen/utils';
import fs from 'fs';

import { encode, decode } from '@ipld/dag-json'
import { CID } from 'multiformats'
import { sha256 } from 'multiformats/hashes/sha2'

import { code } from 'multiformats/codecs/json'

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

export async function level_schema(dddb){
    try {
        const value = await dddb.get('root')
        console.log("\ndddb.get('root')")
        console.log(value)
        console.log("Validating data now")
        return await validate_schema(dddb)
    } catch (error) {
        console.log("\n\n")
        console.log("error.status")
        console.log(error.status)
        return await initialize_app_data(dddb)
    }
}


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
    

    // PKI_store is where all IPNS keys are stored, public and or private
    const PKI_store = dddb.sublevel('PKI', { valueEncoding: 'json' })
    // CID_store is where all the IPFS Cntent Identifiers go
    const CID_store = dddb.sublevel('CID_store', { valueEncoding: 'json' })
    // The root_IPNS is for the nostr_NIP05_server app, its dependencies go under other IPNS keys
    let root_IPNS = (await generate_and_store_IPNS_keys(PKI_store)).toString()
    // #TODO check if we acutally need this anywhere
    await dddb.put("root", root_IPNS)
    // app_data is where we store the data from individuals apps under an IPNS name
    const app_data =  dddb.sublevel('app_data', { valueEncoding: 'json' })
    // app_root_data is where we can actually store app data, well CID's actually
    const app_root_data = app_data.sublevel(root_IPNS, { valueEncoding: 'json' })
    // app_root_data index root is where we store all the IPNS names the app itself and its dependencies
    await app_root_data.put('root',     {
        initialized : true,
        app_ipns_lookup : {}
    })

    // Load in all the schemas even from dependencies
    let db_schema = JSON.parse(await fs.readFileSync('./database/levelSchema.json'))
    for (const DD_dependency of db_schema.dependencies){
        let levelSchema = await JSON.parse( fs.readFileSync( "./database/" + DD_dependency.name.split('.').join('/') + "/levelSchema.json" ) )
        for (const DD_index of Object.keys(levelSchema.schema) ){
            db_schema.schema[DD_dependency.name + "." + DD_index] = levelSchema.schema[DD_index]
        }
    }


    // Generate all the Schema IPNS names and load in the default values
    let schema_ipns_lookup = {}
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
    // apps_root will store IPNS names for each levelSchema
    let apps_root = await app_root_data.get('root')
    // Generate the IPNS name
    apps_root.app_ipns_lookup[db_schema.app_names[0]] = await generate_and_store_IPNS_keys(PKI_store, CID_store)
    // Generate a CID for the IPNS schema
    var cid_value = await CID.create(1, code, await sha256.digest(encode(schema_ipns_lookup)))
    await CID_store.put(cid_value, schema_ipns_lookup)
    await app_root_data.put('root', cid_value)
    const root_app_data = await app_data.sublevel(apps_root.app_ipns_lookup[db_schema.app_names[0]] , { valueEncoding: 'json' })
    var cid_value = await CID.create(1, code, await sha256.digest(encode(schema_ipns_lookup)))
    await CID_store.put(cid_value, schema_ipns_lookup)
    root_app_data.put("config", cid_value)
    return db_schema
}

async function validate_schema(){
    let db_schema = JSON.parse(await fs.readFileSync('./database/levelSchema.json'))
    // let schema_ipns_lookup = {}
    for (const DD_dependency of db_schema.dependencies){
        let levelSchema = await JSON.parse( fs.readFileSync( "./database/" + DD_dependency.name.split('.').join('/') + "/levelSchema.json" ) )
        for (const DD_index of Object.keys(levelSchema.schema) ){
            db_schema.schema[DD_dependency.name + "." + DD_index] = levelSchema.schema[DD_index]
        }
    }


    // TODO
    // Check if app is installed
    // Check if app name is in there
    // get ipns name of the app
    // Check if IPNS name is in pki
    // Get the root of the application with its ipns names
    // Check if we control all those IPNS names
    // Check the default values of the application


    return db_schema
}


// Load data for app to boot
    // admin nostr key
    // dns name
