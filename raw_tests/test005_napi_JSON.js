import { generateSecretKey, getPublicKey } from 'nostr-tools'
import { generateSeedWords, validateWords, privateKeyFromSeedWords } from 'nostr-tools/nip06'
import { finalizeEvent, verifyEvent } from 'nostr-tools';
import * as nip19 from 'nostr-tools/nip19'

import fetch from 'node-fetch';

const mnemonic = "curve foster stay broccoli equal icon bamboo champion casino impact will damp"
let mnemonic_validation = validateWords(mnemonic)
let secret_key = privateKeyFromSeedWords(mnemonic, "", 0)
let public_key = getPublicKey(secret_key)


console.log("secret_key")
console.log(secret_key)
console.log("public_key")
console.log(public_key)
let npub = nip19.npubEncode(public_key)
console.log("npub")
console.log(npub)

let signedEvent = finalizeEvent({
    kind: 1,
    created_at: Math.floor(Date.now() / 1000),
    tags: [
      ['DD']
    ],
    content: 
      JSON.stringify({
        "app_name" : "nostr_NIP05_server",
        "app_key": "ipns://bafzaajaiaejcbwx5s5e73d7s35uukrjazwaw3k7kdql6vfro6z6k3zpkgtmowwgv",
        "query_object" : {
            "name" : "apps.nostr_NIP05_relay_map.dns_names",
            "data" : {
                "variables" : {
                    "$VARIABLE_NAME" : "STRING"
                },
                "value" : {
                    "$VALUE_001" : true
                }
            }
        }
      }),
  }, secret_key)
  
let isGood = verifyEvent(signedEvent)

console.log(`isGood = ${isGood}`)

console.log(`${JSON.stringify(signedEvent)}`)

let fetch_response = await fetch("http://localhost:8081/napi", {
  "method" : "POST",
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(signedEvent)
})

console.log(await fetch_response.json())