import Ajv from 'ajv';

// * Insert relative to variable names and JSON Schema
export async function upsert_using_key_value_patterns(
    DD_index_data_store,
    key_value_patterns, // Should be a list
    input_object
)
{


    // Get all the variables we need from key_value_patterns
    let key_tracker = {} 
    for(const keys of key_value_patterns){
        const regex = /\${(.*?)}/g;
        let match;
        while ((match = regex.exec(inputString)) !== null) {
            key_tracker[match[1]] = true;
        }
    }


    // Check if input_object.variables contains all the correct variables
    let key_tracker_list = Object.keys(key_tracker)
    key_tracker_list.sort((a, b) => a - b);
    let variables_list = Object.keys(input_object.variables)
    variables_list.sort((a, b) => a - b);
    if (key_tracker_list.length !== variables_list.length) {
        return {"error" : "input_object.variables list length"};
    }
    if( ! ( list1.every((value, index) => value === list2[index]) )){
        return {"error" : `input_object.variables do not match ${JSON.stringify(Object.keys(key_tracker))}`}
    }
    

    // Substitute in variables we want to key_value_patterns
    let substituted_key_value_patterns = []
    for (const temp_kv of key_value_patterns){
        substituted_key_value_patterns.push(temp_kv.replace(/\${(.*?)}/g, (match, key) => input_object.variables[key] || match))
    }
    

    // Upsert LevelDB making sure to log the change
    for(const temp_kv of substituted_key_value_patterns){
        let value_to_encode = input_object.value
        var cid_value = CID.create(1, code, await sha256.digest(encode(   value_to_encode   )))
        await CID_store.put(cid_value, value_to_encode)
        try{
            let old_data = await DD_index_data_store.get(temp_kv)
            try {
                let change_log_count = await DD_index_data_store.get("change_log_count")
                change_log_count.value += 1
                await DD_index_data_store.put(`change_log_count`, change_log_count)
                await DD_index_data_store.put(`change_log_index_${change_log_count}`, {
                    "index" : temp_kv,
                    "old_value" : old_data,
                    "new_value" : cid_value,
                    "timestamp" : Date.now()
                })
                await DD_index_data_store.put(temp_kv, cid_value)
            } catch(error){
                await DD_index_data_store.put(temp_kv, cid_value)
            }

        } catch(error) {
            try {
                let change_log_count = await DD_index_data_store.get("change_log_count")
                change_log_count.value += 1
                await DD_index_data_store.put(`change_log_count`, change_log_count)
                await DD_index_data_store.put(`change_log_index_${change_log_count}`, change_log_count)
                await DD_index_data_store.put(temp_kv, cid_value)
            } catch(error){
                await DD_index_data_store.put(temp_kv, cid_value)
            }
        }

    }

}



export async function upsert_using_key_value_patterns_and_JSONSchema(
    DD_index_data_store,
    key_value_patterns, // Should be a list
    input_object,
    JSONSchema_for_validation
)
{
    // Check input_object.data valiates with JSONSchema_for_validation, otherwise return error
    const ajv = new Ajv()
    const JSONSchema_validator = ajv.compile(JSONSchema_for_validation)
    const JSONSchema_test = JSONSchema_validator(input_object.value)
    if(JSONSchema_test){
        upsert_using_key_value_patterns(
            DD_index_data_store,
            key_value_patterns,
            input_object
        )
    }
    else {
        return {"error" : "Failed ro pass JSONSchema test", "data" : JSONSchema_test}
    }
}
