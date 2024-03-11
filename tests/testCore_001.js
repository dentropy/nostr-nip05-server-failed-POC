import assert from "assert"
import { Level } from 'level';
import { level_schema } from "../database/levelSchema.js";
import { upsert_query, get_query, get_index } from "../database/db.js";
import {
  upsert_using_key_value_patterns,
  upsert_using_key_value_patterns_and_JSONSchema
}
  from "../database/queryLogic.js"

describe('Upsert, Get, and Index', async function () {

  let level_db = new Level('./database/testing.leveldb', { valueEncoding: 'json' })
  let dddb = level_db.sublevel('ddaemon', { valueEncoding: 'json' })
  let CID_store = dddb.sublevel('CID_store', { valueEncoding: 'json' })
  let root_IPNS = null;
  let app_data = null;
  let root_app_data_IPNS = null;
  let app_root_CID = null;
  let db_schema = null;
  let app_root = null;
  let app_key = null;

  // These are used in each "it" function
  let query_object = null;
  let query_result = null;

  beforeEach(async function () {
    // level_db = new Level('./database/db.leveldb', { valueEncoding: 'json' })
    // dddb = level_db.sublevel('ddaemon', { valueEncoding: 'json' })
    // CID_store = dddb.sublevel('CID_store', { valueEncoding: 'json' })
    db_schema = await level_schema(dddb)
    root_IPNS = await dddb.get('root')
    app_data = dddb.sublevel('app_data', { valueEncoding: 'json' })
    root_app_data_IPNS = app_data.sublevel(root_IPNS, { valueEncoding: 'json' })
    app_root_CID = await root_app_data_IPNS.get("root")
    app_root = await CID_store.get(app_root_CID["/"])
    app_key = root_IPNS
  });


  describe('Upsert', async function () {
    it('First Upsert Query on index apps.nostr_NIP05_relay_map.dns_names', async function () {
      query_object = {
        "name": "apps.nostr_NIP05_relay_map.dns_names",
        "data": {
          "variables": {
            DNS_NAME: "example.tld"
          },
          "value": {
            "status": true
          }
        }
      }
      query_result = null
      try {
        let current_DD_index = app_data.sublevel(app_root[query_object.name], { valueEncoding: 'json' })
        query_result = await upsert_using_key_value_patterns_and_JSONSchema(
          CID_store,
          current_DD_index,
          db_schema.schema[query_object.name].key_value_patterns,
          query_object.data,
          db_schema.schema[query_object.name].upsert_json_schema
        )
      } catch (error) {
        assert.equal(1, 2, `upsert_using_key_value_patterns_and_JSONSchema failed for Upsert\n${error}`);
      }
    });


    it('First Upsert Query on index apps.nostr_NIP05_relay_map.NIP05_internet_identifier', async function () {
      query_object = {
        "name" : "apps.nostr_NIP05_relay_map.NIP05_internet_identifier",
        "data" : {
            "variables" : {
                "DNS_NAME" : "ddaemon.org",
                "NOSTR_NAME_LOCAL_PART" : "matthew",
                "NOSTR_PUBLIC_KEY" : "npub15kpvwpk66wns84kqyywuyhntkt9ujzqua47z4katjy2shyzkgknsejdaas"
            },
            "value" : {
                "NOSTR_NAME_LOCAL_PART" : "matthew",
                "NOSTR_PUBLIC_KEY" : "npub15kpvwpk66wns84kqyywuyhntkt9ujzqua47z4katjy2shyzkgknsejdaas",
                "DNS_NAME" : "ddaemon.org",
                "relays" : ["wss:/test.lol/"]
            }
        }
      }
      let query_result = null
      try {
        let current_DD_index = app_data.sublevel(app_root[query_object.name], { valueEncoding: 'json' })
        query_result = await upsert_using_key_value_patterns_and_JSONSchema(
          CID_store,
          current_DD_index,
          db_schema.schema[query_object.name].key_value_patterns,
          query_object.data,
          db_schema.schema[query_object.name].upsert_json_schema
        )
      } catch (error) {
        assert.equal(1, 2, `upsert_using_key_value_patterns_and_JSONSchema failed for Upsert\n${error}`);
      }
    });
  });


  describe('Get', async function () {
    it('Get the data that was stored in the previous upsert query', async function () {
      let query_object = {
        "name": "apps.nostr_NIP05_relay_map.dns_names",
        "data": {
          "variables": {
            DNS_NAME: "example.tld"
          }
        }
      }
      let query_result = await get_query(dddb, db_schema, query_object)
      assert.equal(query_result.status, true)
    });
  });


  describe('Index', async function () {
    it('Checking if the index returns correct number of values', async function () {
      let query_result = await get_index(
        dddb,
        'apps.nostr_NIP05_relay_map.NIP05_internet_identifier',
        "nip05_dns_first_"
      )
      console.log(query_result)
      assert.equal(Object.keys(query_result).length, 1, "Too many results, try reseting LevelDB")
    });
  });
});