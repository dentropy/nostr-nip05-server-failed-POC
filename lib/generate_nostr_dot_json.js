import { get_index } from "../database/db.js";
import { upsert_using_key_value_patterns_and_JSONSchema } from "../database/queryLogic.js";


export async function generate_nostr_dot_json(level_schema_config, command_JSON){
    // Pull out the domain name
    let tmp_domain_name = command_JSON.query_object.data.variables.DNS_NAME
    // Grab all records
    let NIP05_index = await get_index(
        level_schema_config.dddb, 
        'apps.nostr_NIP05_relay_map.NIP05_internet_identifier', 
        "nip05_dns_first_"
    )
    let nostr_dot_json = {
        "names": {},
        "relays": {}
    }
    for (const nip05_dns of Object.keys(NIP05_index)) {
        if (nip05_dns.includes("nip05_dns_first_")) {
            let CID_data = await level_schema_config.CID_store.get(NIP05_index[nip05_dns]["/"])
            nostr_dot_json.names[CID_data.NOSTR_NAME_LOCAL_PART] = JSON.parse(JSON.stringify(CID_data.NOSTR_PUBLIC_KEY))
            nostr_dot_json.relays[CID_data.NOSTR_PUBLIC_KEY] = JSON.parse(JSON.stringify(CID_data.relays))
        }
    }
    let current_app_store = level_schema_config.app_data.sublevel(level_schema_config.app_root["nostr_json"], { valueEncoding: 'json' })
    let query_result = await upsert_using_key_value_patterns_and_JSONSchema(
        level_schema_config.CID_store,
        current_app_store,
        level_schema_config.db_schema.schema["nostr_json"].key_value_patterns,
        {
            variables: {
                DNS_NAME: tmp_domain_name
            },
            value: nostr_dot_json
        },
        level_schema_config.db_schema.schema["nostr_json"].upsert_json_schema
    )
    console.log("query_result")
    console.log(query_result)
    return nostr_dot_json
}