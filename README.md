#### nostr-nip05-server

http://localhost:8081/appnames

http://localhost:8081/.well-known/nostr.json

``` bash

rm -rf ./database/db.leveldb

node ./database/levelSchema.js

node ./database/dump.js

node ./database/dump.js > dbDump.ndjson && jq '.' dbDump.ndjson > test2.ndjson && mv test2.ndjson dbDump.ndjson


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

#### Tests

``` bash

export NOSTR_ADMIN_PUBLIC_KEY="npub15kpvwpk66wns84kqyywuyhntkt9ujzqua47z4katjy2shyzkgknsejdaas" 
rm -rf database/testapi.db
node index.js -lp ./database/testapi.db

```

``` bash

npm run test

```

#### Reminders

* [ed25519-keygen - npm](https://www.npmjs.com/package/ed25519-keygen)
* [leveldb sublevel example](https://github.com/Level/level?tab=readme-ov-file#dbbatchoperations-options-callback)
