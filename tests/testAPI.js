import { generateSecretKey, getPublicKey } from 'nostr-tools'
import { generateSeedWords, validateWords, privateKeyFromSeedWords } from 'nostr-tools/nip06'
import { finalizeEvent, verifyEvent } from 'nostr-tools';
import * as nip19 from 'nostr-tools/nip19'
import assert from "assert"

describe('Test auth on API', async function () {

  const mnemonic = "curve foster stay broccoli equal icon bamboo champion casino impact will damp"
  let secret_key = null;
  let public_key = null;
  let npub = null;
  let appsnames = null;

  // These are used in each "it" function
  let fetch_response = null;

  beforeEach(async function () {

    let mnemonic_validation = validateWords(mnemonic)
    secret_key = privateKeyFromSeedWords(mnemonic, "", 0)
    public_key = getPublicKey(secret_key)
    npub = nip19.npubEncode(secret_key)


    appsnames = await fetch("http://localhost:8081/appnames")
    appsnames = await appsnames.json()

  });

  describe("Use Admin to set NIP05 Internet Identifier", async function () {
    it('First event example for NIP05 Internet Identifier', async function () {
      let signedEvent = finalizeEvent({
        kind: 1,
        created_at: Math.floor(Date.now() / 1000),
        tags: [
          ['DD']
        ],
        content:
          JSON.stringify({
            "app_name": "nostr_NIP05_server",
            "app_key": appsnames.app_key,
            "query_type": "upsert",
            "query_object": {
              "name": "apps.nostr_NIP05_relay_map.NIP05_internet_identifier",
              "data": {
                "variables": {
                  "DNS_NAME": "ddaemon.org",
                  "NOSTR_NAME_LOCAL_PART": "dentropy",
                  "NOSTR_PUBLIC_KEY": public_key
                },
                "value": {
                  "NOSTR_NAME_LOCAL_PART": "dentropy",
                  "NOSTR_PUBLIC_KEY": public_key,
                  "DNS_NAME": "ddaemon.org",
                  "relays": ["wss://relay.nostr.band/", "wss://bitcoinmaximalists.online/", "wss://relay.damus.io/"]
                }
              }
            }
          }),
      }, secret_key)
      assert.equal(await verifyEvent(signedEvent), true, "verify Nostr event failed")
      try {
        fetch_response = await fetch("http://localhost:8081/napi", {
          "method": "POST",
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(signedEvent)
        })
        fetch_response = await fetch_response.json()
      } catch (error) {
        assert.equal(true, false, "fetch failed, you need to be running the server to run these tests")
      }
      assert.equal(fetch_response.status == "success", true, "First event was not sucessful")
    })

  })
})