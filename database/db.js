import {
    upsert_using_key_value_patterns_and_JSONSchema,
    upsert_using_key_value_patterns
} from "./queryLogic.js"

export async function upsert_query(dddb, db_schema, query_object){
    if(!Object.keys(query_object).includes("name")){
        return {"error" : "invalid query_object, missing name key"}
    }
    if(!Object.keys(query_object).includes("data")){
        return {"error" : "invalid query_object, missing data key"}
    }
    if(!Object.keys(db_schema.schema).includes(query_object.name)){
        return {"error" : "query_object.name not found in db_schema.schema"}
    }
    
    const CID_store = dddb.sublevel('CID_store', { valueEncoding: 'json' })
    let root_IPNS = await dddb.get('root')
    const app_data =  dddb.sublevel('app_data', { valueEncoding: 'json' })
    const root_app_data_IPNS = app_data.sublevel(root_IPNS, { valueEncoding: 'json' })
    const app_root_CID = await root_app_data_IPNS.get("root")
    let app_root = await CID_store.get(app_root_CID["/"])

    if( !Object.keys(app_root).includes(query_object.name)){
        return {"error" : `App ${query_object.name} not corectly installed \n
            ${JSON.stringify(app_root)}`}
    }
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
    return true

}

export async function get_query(dddb, db_schema, query_object){


    const CID_store = dddb.sublevel('CID_store', { valueEncoding: 'json' })
    let root_IPNS = await dddb.get('root')
    const app_data =  dddb.sublevel('app_data', { valueEncoding: 'json' })
    const root_app_data_IPNS = app_data.sublevel(root_IPNS, { valueEncoding: 'json' })
    const app_root_CID = await root_app_data_IPNS.get("root")
    let app_root = await CID_store.get(app_root_CID["/"])


    if(!Object.keys(query_object).includes("name")){
        return {"error" : "invalid query_object, missing name key"}
    }
    if(!Object.keys(query_object).includes("data")){
        return {"error" : "invalid query_object, missing data key"}
    }
    if(!Object.keys(db_schema.schema).includes(query_object.name)){
        return {"error" : "query_object.name not found in db_schema.schema"}
    }
    if( !Object.keys(app_root).includes(query_object.name)){
        return {"error" : `App ${query_object.name} not corectly installed \n
            ${JSON.stringify(app_root)}`}
    }
    let app_sublevel = app_data.sublevel(app_root[query_object.name], { valueEncoding: 'json' })

    let key = null;
    if(!Object.keys(query_object).includes("key_value_pattern")){
        key = db_schema.schema[query_object.name].key_value_patterns[0].replace(/\${(.*?)}/g, (match, key) => query_object.data.variables[key] || match)
    } else {
        key = query_object.key_value_pattern.replace(/\${(.*?)}/g, (match, key) => query_object.data.variables[key] || match)
    }
    console.log("key")
    console.log(key)
    let tmp_CID = (await app_sublevel.get(key) )["/"] 
    let tmp_result = await CID_store.get( tmp_CID )
    return tmp_result
}


export async function get_index(dddb, app_name, key_value_pattern){

    const CID_store = dddb.sublevel('CID_store', { valueEncoding: 'json' })
    let root_IPNS = await dddb.get('root')
    const app_data =  dddb.sublevel('app_data', { valueEncoding: 'json' })
    const root_app_data_IPNS = app_data.sublevel(root_IPNS, { valueEncoding: 'json' })
    const app_root_CID = await root_app_data_IPNS.get("root")
    let app_root = await CID_store.get(app_root_CID["/"])


    if( !Object.keys(app_root).includes(app_name)){
        return {"error" : `App ${app_name} not corectly installed \n
            ${JSON.stringify(app_root)}`}
    }

    console.log("app_root[app_name]")
    console.log(app_root[app_name])


    let app_sublevel = app_data.sublevel(app_root[app_name], { valueEncoding: 'json' })


    let results = {}
    for await (const [key, value] of app_sublevel.iterator({ gte: key_value_pattern, lte : key_value_pattern + "~" })) {
        results[key] = value // await CID_store.get(value["/"])
    }
    return results

}
