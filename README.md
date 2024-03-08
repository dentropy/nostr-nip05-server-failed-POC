#### nostr-nip05-server

http://localhost:8081/appnames

http://localhost:8081/.well-known/nostr.json

``` bash

rm -rf ./database/db.leveldb

node ./database/levelSchema.js

node ./database/dump.js

node ./database/dump.js > test.ndjson && jq '.' test.ndjson > test2.ndjson


```



``` bash

# VALID
export NOSTR_ADMIN_PUBLIC_KEY="npub15kpvwpk66wns84kqyywuyhntkt9ujzqua47z4katjy2shyzkgknsejdaas"

# INVALID
export NOSTR_ADMIN_PUBLIC_KEY="npub000000"

# INVALID
export NOSTR_ADMIN_PUBLIC_KEY=""

echo $NOSTR_ADMIN_PUBLIC_KEY


export NOSTR_DNS_NAME=""

export NOSTR_DNS_NAME="dentropic.net"

```

## napi

``` json

{
    "DD" : {
        "app_name" : "nostr_NIP05_server",
        "app_key": "ipfs://${IPNS_NAME}",
        "query_object" : {
            "name" : "",
            "type" : "",
            "key_value_pattern" : "",
            "data" : {
                "variables" {
                    "$VARIABLE_NAME" : "STRING"
                },
                "value" : {
                    "$VALUE_001" : true
                }
            }
        }
    }
}

```



#### Reminders

* [ed25519-keygen - npm](https://www.npmjs.com/package/ed25519-keygen)
* [leveldb sublevel example](https://github.com/Level/level?tab=readme-ov-file#dbbatchoperations-options-callback)
