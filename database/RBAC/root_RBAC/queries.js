import fs from 'fs';


import { encode, decode } from '@ipld/dag-json'
import { CID } from 'multiformats'
import { sha256 } from 'multiformats/hashes/sha2'
import { code } from 'multiformats/codecs/json'


export async function add_rule(DD_index_data_store, CID_store, value_object){
    let schema = JSON.stringify(  fs.readFileSync("./levelSchema.json") )

    var cid_value = CID.create(1, code, await sha256.digest(encode(   value_object   )))
    await CID_store.put(cid_value, value_to_encode)
    await current_app_data_dir.put(DD_default_value, cid_value)

}


export async function update_rule(){}

export async function get_rule(){}


// Add nostr_key to a rule

// Remove nostr_key from rule

// Check if auth_app exists

// Check if auth_app is turned on

// Validate auth

// Turn on rule

// Turn off rule
