#### nostr-nip05-server


``` bash

rm -rf ./database/db.leveldb

node ./database/levelSchema.js

node ./database/dump.js

node ./database/dump.js > test.ndjson && cat test.ndjson | jq


```



``` bash

# VALID
export NOSTR_ADMIN_PUBLIC_KEY="npub1ek36rza32zjc8pec8daz6veyywv55xtemzaxr0saymd04a4r66eqpxphdl"

# INVALID
export NOSTR_ADMIN_PUBLIC_KEY="npub000000"

# INVALID
export NOSTR_ADMIN_PUBLIC_KEY=""

echo $NOSTR_ADMIN_PUBLIC_KEY


export NOSTR_DNS_NAME=""

export NOSTR_DNS_NAME="dentropic.net"

```


#### Reminders

* [ed25519-keygen - npm](https://www.npmjs.com/package/ed25519-keygen)
* [leveldb sublevel example](https://github.com/Level/level?tab=readme-ov-file#dbbatchoperations-options-callback)
