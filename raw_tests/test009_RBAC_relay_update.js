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
let sk = nip19.decode("nsec1jtjlfqg5ex7zz3azeawux0lp4uwufklc83azfy4x65dyfp9tgm9qyda0f8")
console.log("sk")
console.log(sk)
let pk = getPublicKey(sk.data)
console.log("pk")
console.log(pk)

let appsnames = await fetch("http://localhost:8081/appnames")
appsnames = await appsnames.json()
console.log(appsnames)

let signedEvent = finalizeEvent({
    kind: 1,
    created_at: Math.floor(Date.now() / 1000),
    tags: [
      ['DD']
    ],
    content: 
      JSON.stringify({
        "app_name" : "nostr_NIP05_server",
        "app_key": appsnames.app_key,
        "query_type" : "upsert",
        "query_object" : {
            "name" : "apps.nostr_NIP05_relay_map.NIP05_internet_identifier",
            "data" : {
                "variables" : {
                    "DNS_NAME" : "ddaemon.org",
                    "NOSTR_NAME_LOCAL_PART" : "matthew",
                    "NOSTR_PUBLIC_KEY" : pk
                },
                "value" : {
                    "NOSTR_NAME_LOCAL_PART" : "matthew",
                    "NOSTR_PUBLIC_KEY" : pk,
                    "DNS_NAME" : "ddaemon.org",
                    "relays" : ["wss://relay.nostr.band/", "wss://bitcoinmaximalists.online/", "wss://relay.damus.io/"]
                }
            }
        }
      }),
  }, sk.data)
  
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