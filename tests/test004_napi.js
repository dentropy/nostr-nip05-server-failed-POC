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
let npub = nip19.npubEncode(secret_key)
console.log("npub")
console.log(npub)

let signedEvent = finalizeEvent({
    kind: 1,
    created_at: Math.floor(Date.now() / 1000),
    tags: [],
    content: 'hello',
  }, secret_key)
  
  let isGood = verifyEvent(signedEvent)

console.log(`isGood = ${isGood}`)

console.log(`${JSON.stringify(signedEvent)}`)
