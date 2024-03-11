import Ajv from 'ajv';

import { encode, decode } from '@ipld/dag-json'
import { CID } from 'multiformats'
import { sha256 } from 'multiformats/hashes/sha2'
import { code } from 'multiformats/codecs/json'

// * Insert relative to variable names and JSON Schema
export async function upsert_using_key_value_patterns(
    CID_store,
    DD_index_data_store,
    key_value_patterns, // Should be a list
    input_object
)
{
    console.log("key_value_patterns")
    console.log(key_value_patterns)

    // Get all the variables we need from key_value_patterns
    let key_tracker = {} 
    for(const variable_keys of key_value_patterns){
        const regex = /\${(.*?)}/g;
        let match;
        while ((match = regex.exec(variable_keys)) !== null) {
            key_tracker[match[1]] = true;
        }
    }

    console.log("key_tracker")
    console.log(key_tracker)


    // Check if input_object.variables contains all the correct variables
    if(key_tracker.hasOwnProperty("LOG_AUTO_INCREMENT")){
        delete key_tracker["LOG_AUTO_INCREMENT"]
    }
    let key_tracker_list = Object.keys(key_tracker)
    key_tracker_list.sort((a, b) => a - b);
    let variables_list = Object.keys(input_object.variables)
    variables_list.sort((a, b) => a - b);


    console.log("variables_list")
    console.log(variables_list)


    if (key_tracker_list.length !== variables_list.length) {
        return {"error" : "input_object.variables list length"};
    }
    // if( ! ( key_tracker_list.every((value, index) => value === variables_list[index]) )){
    //     return {"error" : `input_object.variables do not match ${JSON.stringify(Object.keys(key_tracker))}`}
    // }

    console.log("Still_chugging_along")
    

    // Substitute in variables we want to key_value_patterns
    let substituted_key_value_patterns = []
    for (const temp_kv of key_value_patterns){
        substituted_key_value_patterns.push(temp_kv.replace(/\${(.*?)}/g, (match, key) => input_object.variables[key] || match))
    }

    console.log("substituted_key_value_patterns")
    console.log(substituted_key_value_patterns)
    

    // Upsert LevelDB making sure to log the change
    for(const temp_kv of substituted_key_value_patterns){
        var cid_value = CID.create(1, code, await sha256.digest(encode( input_object.value )))

        console.log("input_object.value")
        console.log(input_object.value)
        console.log("cid_value")
        console.log(cid_value.toString())

        await CID_store.put(cid_value.toString(), input_object.value)
        let CID_TEST = await CID_store.get(cid_value.toString())
        console.log("CID_TEST")
        console.log(CID_TEST)
        try{
            let old_data = await DD_index_data_store.get(temp_kv)
            try {
                let change_log_count = await DD_index_data_store.get("change_log_count")
                await DD_index_data_store.put(`change_log_index_${change_log_count.value}`, {
                    "index" : temp_kv.toLowerCase(),
                    "old_value" : old_data,
                    "new_value" : cid_value.toString(),
                    "timestamp" : Date.now()
                })
                change_log_count.value += 1
                await DD_index_data_store.put(`change_log_count`, change_log_count)
                await DD_index_data_store.put(temp_kv.toLowerCase(), cid_value)
            } catch(error){
                await DD_index_data_store.put(temp_kv.toLowerCase(), cid_value)
            }

        } catch(error) {
            try {
                let change_log_count = await DD_index_data_store.get("change_log_count")
                await DD_index_data_store.put(`change_log_index_${change_log_count.value}`, {
                    "index" : temp_kv.toLowerCase(),
                    "old_value" : null,
                    "new_value" : cid_value.toString(),
                    "timestamp" : Date.now()
                })
                change_log_count.value += 1
                await DD_index_data_store.put(`change_log_count`, change_log_count)
                await DD_index_data_store.put(temp_kv.toLowerCase(), cid_value)
            } catch(error){
                await DD_index_data_store.put(temp_kv.toLowerCase(), cid_value)
            }
        }

    }
    return true
}



export async function upsert_using_key_value_patterns_and_JSONSchema(
    CID_store,
    DD_index_data_store,
    key_value_patterns, // Should be a list
    input_object,
    JSONSchema_for_validation
)
{
    // Check input_object.data valiates with JSONSchema_for_validation, otherwise return error
    console.log("CHECKME")
    console.log(JSON.stringify(JSONSchema_for_validation, null, 2))
    console.log(JSON.stringify(input_object, null, 2))

    const ajv = new Ajv()
    const JSONSchema_validator = ajv.compile(JSONSchema_for_validation)
    const JSONSchema_test = JSONSchema_validator(input_object)

    console.log("JSONSchema_test")
    console.log(JSONSchema_test)
    if(JSONSchema_test){
        return await upsert_using_key_value_patterns(
            CID_store,
            DD_index_data_store,
            key_value_patterns,
            input_object
        )
    }
    else {
        return {"error" : "Failed to pass JSONSchema test", "data" : JSONSchema_test}
    }
}
