
import { Level } from 'level';
import ipns from 'ed25519-keygen/ipns';
import { randomBytes } from 'ed25519-keygen/utils';
import fs from 'fs';

import { encode, decode } from '@ipld/dag-json'
import { CID } from 'multiformats'
import { sha256 } from 'multiformats/hashes/sha2'

import { code } from 'multiformats/codecs/json'

const db = new Level('./database/db.leveldb', { valueEncoding: 'json' })
let db_schema = JSON.parse(await fs.readFileSync('./database/levelSchema.json'))

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

// If no app directory exists create the app


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
    const apps = dddb.sublevel('apps', { valueEncoding: 'json' })

    // Create IPNS key
    const iseed = randomBytes(32);
    const ikeys = await ipns(iseed);
    // console.log(ikeys.privateKey);
    // console.log(ikeys.publicKey);
    // console.log(ikeys.base16);
    // console.log(ikeys.base32);
    // console.log(ikeys.base32);
    // console.log(ikeys.base36);
    // console.log(ikeys.contenthash);

    // Store it in pki
    const pki = dddb.sublevel('pki', { valueEncoding: 'json' })
    const cid_store = dddb.sublevel('cid_store', { valueEncoding: 'json' })
    var value_to_encode = {
        privateKey : ikeys.privateKey,
        publicKey  : ikeys.publicKey
    }
    var cid_value = CID.create(1, code, await sha256.digest(encode(value_to_encode)))
    await cid_store.put(cid_value, value_to_encode)
    await pki.put(`public_key_${ikeys.base32}`, cid_value)


    // Register the app in the apps sublevel
    let apps_root = await dddb.get('root')
    apps_root.app_ipns_lookup[db_schema.app_names[0]] = ikeys.base32
    var cid_value = CID.create(1, code, await sha256.digest(encode(apps_root)))
    await cid_store.put(cid_value, value_to_encode)
    await apps.put('root', cid_value)


    // Create app_data directory, then create directory for our specific app

    let schema_ipns_lookup = db_schema.schema.root.load_defaults.namespace_to_ipns.value
    const raw_app_data =  dddb.sublevel('app_data', { valueEncoding: 'json' })
    const app_data = raw_app_data.sublevel('app_' + ikeys.base32, { valueEncoding: 'json' })
    for (const schema_sublevel_name of Object.keys(db_schema.schema) ) {
        const iseed = await randomBytes(32);
        const ikeys = await ipns(iseed);
        var value_to_encode = {
            privateKey : await ikeys.privateKey,
            publicKey  : await ikeys.publicKey
        }
        var cid_value = await CID.create(1, code, await sha256.digest(await encode(value_to_encode)))
        await cid_store.put(cid_value, value_to_encode)
        schema_ipns_lookup[schema_sublevel_name] = await ikeys.base32
        
        //console.log(schema_ipns_lookup)
        
        var current_sublevel = app_data.sublevel("app_" + ikeys.base32, { valueEncoding: 'json' })
        for ( const default_key_to_load of Object.keys(db_schema.schema[schema_sublevel_name].load_defaults) ) {
            var value_to_encode = db_schema.schema[schema_sublevel_name].load_defaults[default_key_to_load]
            var cid_value = CID.create(1, code, await sha256.digest(encode(value_to_encode)))
            await cid_store.put(cid_value, value_to_encode)
            await current_sublevel.put(default_key_to_load, value_to_encode)
        }
    };
    console.log("\n\n")
    console.log("schema_ipns_lookup")
    console.log(schema_ipns_lookup)
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