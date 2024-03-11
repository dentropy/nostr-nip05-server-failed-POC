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
  let secret_key2 = null;
  let public_key2 = null;
  let npub2 = null;
  let appsnames = null;

  // These are used in each "it" function
  let fetch_response = null;

  beforeEach(async function () {

    let mnemonic_validation = validateWords(mnemonic)
    secret_key = privateKeyFromSeedWords(mnemonic, "", 0)
    public_key = getPublicKey(secret_key)
    npub = nip19.npubEncode(secret_key)

    secret_key2 = privateKeyFromSeedWords(mnemonic, "", 1)
    public_key2 = getPublicKey(secret_key2)
    npub2 = nip19.npubEncode(secret_key2)


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
      assert.equal(fetch_response.status == "success", true, `First event was not sucessful \n${JSON.stringify(fetch_response, null, 2)}`)
    })

  })


  describe("Use Admin to set NIP05 Internet Identifier for new Public Key", async function () {
    it('First event example for NIP05 Internet Identifier', async function () {
      assert.equal(public_key != public_key2, true, "Good we have separate accounts generated from the mnemonic")
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
                  "NOSTR_NAME_LOCAL_PART": "matthew",
                  "NOSTR_PUBLIC_KEY": public_key2
                },
                "value": {
                  "NOSTR_NAME_LOCAL_PART": "matthew",
                  "NOSTR_PUBLIC_KEY": public_key2,
                  "DNS_NAME": "ddaemon.org",
                  "relays": ["wss://ddaemon.org/"]
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
      assert.equal(fetch_response.status == "success", true, `Event did not return with sucess\n${fetch_response}`)
      // TODO validate the relays on .well-known/nostr.json
    })
  })


  describe("Use Admin to set NIP05 RBAC.root_RBAC.secp256k1_auth_app to public_key2", async function () {
    it('Use Admin to set NIP05 RBAC.root_RBAC.secp256k1_auth_app to public_key2', async function () {
      assert.equal(public_key != public_key2, true, "Good we have separate accounts generated from the mnemonic")
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
                "name" : "RBAC.root_RBAC.secp256k1_auth_app",
                "data" : {
                    "variables" : {
                        "APP_RULE" : "nip05_user",
                        "secp256k1_PUBLIC_KEY" : public_key2
                    },
                    "value" : {
                        "enabled" : true,
                        secp256k1_PUBLIC_KEY : public_key2
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
      assert.equal(fetch_response.status == "success", true, `Event returned was not sucessful\n${JSON.stringify(fetch_response, null, 2)}`)
      // TODO validate the relays on .well-known/nostr.json
    })
  })


  describe("Use secret_key2 to update the relay list", async function () {
    it('First event example for NIP05 Internet Identifier', async function () {
      assert.equal(public_key != public_key2, true, "Good we have separate accounts generated from the mnemonic")
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
                  "NOSTR_NAME_LOCAL_PART": "matthew",
                  "NOSTR_PUBLIC_KEY": public_key2
                },
                "value": {
                  "NOSTR_NAME_LOCAL_PART": "matthew",
                  "NOSTR_PUBLIC_KEY": public_key2,
                  "DNS_NAME": "ddaemon.org",
                  "relays": ["wss://test.test.test/", "wss://bitcoinmaximalists.online/", "wss://relay.damus.io/"]
                }
              }
            }
          }),
      }, secret_key2)
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
      assert.equal(fetch_response.status == "success", true, `Event returned was not sucessful\n${JSON.stringify(fetch_response, null, 2)}`)
      // TODO validate the relays on .well-known/nostr.json
    })
  })



})