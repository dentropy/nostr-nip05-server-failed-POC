import fs from 'fs';

let raw_json = await fs.readFileSync("./database/levelSchema.json")
let levelSchema = JSON.parse(raw_json)

console.log( JSON.stringify(levelSchema, null, 2))

let elements = {
    "nodes" : [],
    "edges" : []
}


// SCHEMA_VARIABLES
Object.keys(levelSchema.schema_variables).forEach( (schema_variable)=> {
    elements.nodes.push(
        {
            data : {
                id : `schema_variable__${schema_variable}`,
                type : "schema_variables",
                name : schema_variable,
                display_name : schema_variable
            }
        }
    )
})


// INDEXES + KEY_VALUE_PATTERNS
Object.keys(levelSchema.schema).forEach( (dd_index)=> {
    elements.nodes.push(
        {
            data : {
                id : `dd_index__${dd_index}`,
                type : "index",
                name : dd_index,
                display_name : dd_index
            }
        }
    )
    levelSchema.schema[dd_index].key_value_patterns.forEach( (key_value_pattern)=> {
        elements.nodes.push(
            {
                data : {
                    id : `key_value_pattern__${key_value_pattern}`,
                    dd_index : dd_index,
                    type : "key_value_patterns",
                    pattern : key_value_pattern,
                    display_name : dd_index
                }
            }
        )
        elements.edges.push(
            { 
                data : {
                    id : `dd_index__${dd_index}` + "__TO__" + `key_value_pattern__${key_value_pattern}`,
                    source : `dd_index__${dd_index}`,
                    target : `key_value_pattern__${key_value_pattern}`,
                    type : "index_to_kvp"
                } 
            }
        )


        const regex = /\${(.*?)}/g;
        const extractedTexts = [];
        let match;
        while ((match = regex.exec(key_value_pattern)) !== null) {
            extractedTexts.push(match[1]);
        }
        extractedTexts.forEach( (schema_variable) => {
        elements.edges.push(
            { 
                data : {
                    id : `key_value_pattern__${key_value_pattern}` + "__TO__" + `schema_variable__${schema_variable}`,
                    source : `key_value_pattern__${key_value_pattern}`,
                    target : `schema_variable__${schema_variable}`,
                    type : "kbp_to_schema_variable"
                } 
            }
        )
        })

    })
})

// VALUES

await fs.writeFileSync("./database/cytoscapeElements.json", JSON.stringify(elements, null, 2))
await fs.writeFileSync("./database/cytoscapeElements.js", "let mah_elements = " + JSON.stringify(elements, null, 2) )