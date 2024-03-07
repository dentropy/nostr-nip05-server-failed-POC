import {
    upsert_using_key_value_patterns_and_JSONSchema,
    upsert_using_key_value_patterns
} from "./queryLogic.js"

export async function run_query(dddb, db_schema, query_object){
    // Loop through schema for queries
    if(!Object.keys(query_object).includes("name")){
        return {"error" : "invalid query_object, missing name key"}
    }
    if(!Object.keys(query_object).includes("data")){
        return {"error" : "invalid query_object, missing data key"}
    }
    if(!Object.keys(db_schema.schema).includes(query_object.name)){
        return {"error" : "query_object.name not found in db_schema.schema"}
    }
    let app_root_CID = await dddb.get('root')
    const CID_store = dddb.sublevel('CID_store', { valueEncoding: 'json' })
    let app_root = await CID_store.get(app_root_CID["/"])
    console.log("app_root")
    console.log(app_root)
    if( !Object.keys(app_root).includes(query_object.name)){
    let app_root = await CID_store.get(app_root_CID["/"])
        return {"error" : `App ${query_object.name} not corectly installed \n
            ${JSON.stringify(app_root)}`}
    }
    const app_data =  dddb.sublevel('app_data', { valueEncoding: 'json' })
    let app_sublevel = app_data.sublevel(app_root[query_object.name], { valueEncoding: 'json' })

    if( Object.keys(db_schema.schema[query_object.name]).includes("upsert_json_schema")){
        // console.log(JSON.stringify(query_object.data, null, 2))
        // console.log(JSON.stringify(db_schema.schema[query_object.name].upsert_json_schema, null, 2))
        await upsert_using_key_value_patterns_and_JSONSchema(
            CID_store,
            app_sublevel,
            db_schema.schema[query_object.name].key_value_patterns,
            query_object.data,
            db_schema.schema[query_object.name].upsert_json_schema
        )
    }
    else {
        await upsert_using_key_value_patterns(
            CID_store,
            app_sublevel,
            db_schema.schema[query_object.name].key_value_patterns,
            query_object.data
        )
    }

}



