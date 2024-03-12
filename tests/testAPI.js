import { generateSecretKey, getPublicKey } from 'nostr-tools'
import { generateSeedWords, validateWords, privateKeyFromSeedWords } from 'nostr-tools/nip06'
import { finalizeEvent, verifyEvent } from 'nostr-tools';
import * as nip19 from 'nostr-tools/nip19'
import assert from "assert"

// IPFS CID imports
import { encode, decode } from '@ipld/dag-json'
import { CID } from 'multiformats'
import { sha256 } from 'multiformats/hashes/sha2'

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
    npub = nip19.npubEncode(public_key)

    secret_key2 = privateKeyFromSeedWords(mnemonic, "", 1)
    public_key2 = getPublicKey(secret_key2)
    npub2 = nip19.npubEncode(public_key2)


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
            "app_name": "nostr_NIP05_server",
            "app_key": appsnames.app_key,
            "query_type": "upsert",
            "query_object": {
              "name": "RBAC.root_RBAC.secp256k1_auth_app",
              "data": {
                "variables": {
                  "APP_RULE": "nip05_user",
                  "secp256k1_PUBLIC_KEY": public_key2
                },
                "value": {
                  "enabled": true,
                  secp256k1_PUBLIC_KEY: public_key2
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

  describe("Test DD_token_RBAC", async function () {

    let first_test_token = null;
    it('Deploy a token using the root permissions', async function () {
      let request_data = {
        "app_name": "RBAC.DD_token_RBAC.deploy",
        "app_key": appsnames.app_key,
        "query_type": "upsert",
        "query_object": {
          "name": "RBAC.DD_token_RBAC.deploy",
          "data": {
            "variables": {
              "TOKEN_ID": "PLACEHOLDER"
            },
            "value": {
              "app_name": "DD_token_RBAC",
              "version": "0.0.1",
              "signing_public_key": nip19.npubEncode(public_key),
              "operation_name": "deploy",
              "timestamp_ms": Date.now(),
              "operation_data": {
                "token_name": "TEST TOKEN",
                "token_ticker": "TEST",
                "max_supply": "1000000000000000",
                "limit_per_mint": "1000000000",
                "decimals": 3,
                "inital_token_admins": [
                  nip19.npubEncode(public_key)
                ]
              }
            }
          }
        }
      }
      const JSON_code = 0x0200
      let encoded = encode(request_data.query_object.data.value)
      let hash = await sha256.digest(encoded)
      let cidv1 = CID.create(1, JSON_code, hash)
      first_test_token = String(cidv1)
      request_data.query_object.data.variables.TOKEN_ID = String(cidv1)
      let signedEvent = finalizeEvent({
        kind: 1,
        created_at: Math.floor(Date.now() / 1000),
        tags: [
          ['DD']
        ],
        content:
          JSON.stringify(request_data),
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

    it('Deploy a token using the root permissions, with invalid inital_token_admins', async function () {
      let request_data = {
        "app_name": "RBAC.DD_token_RBAC.deploy",
        "app_key": appsnames.app_key,
        "query_type": "upsert",
        "query_object": {
          "name": "RBAC.DD_token_RBAC.deploy",
          "data": {
            "variables": {
              "TOKEN_ID": "PLACEHOLDER"
            },
            "value": {
              "app_name": "DD_token_RBAC",
              "version": "0.0.1",
              "signing_public_key": nip19.npubEncode(public_key),
              "operation_name": "deploy",
              "timestamp_ms": Date.now(),
              "operation_data": {
                "token_name": "TEST TOKEN",
                "token_ticker": "TEST",
                "max_supply": "100000000000000000",
                "limit_per_mint": "1000000000",
                "decimals": 3,
                "inital_token_admins": [
                  "!@#"
                ]
              }
            }
          }
        }
      }
      const JSON_code = 0x0200
      let encoded = encode(request_data.query_object.data.value)
      let hash = await sha256.digest(encoded)
      let cidv1 = CID.create(1, JSON_code, hash)
      request_data.query_object.data.variables.token_ID = String(cidv1)
      let signedEvent = finalizeEvent({
        kind: 1,
        created_at: Math.floor(Date.now() / 1000),
        tags: [
          ['DD']
        ],
        content:
          JSON.stringify(request_data),
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
      assert.equal(fetch_response.status == "ERROR", true, `Invalid nostr key allowed in\n${JSON.stringify(fetch_response, null, 2)}`)
    })


    it('Mint a token', async function () {
      let request_data = {
        "app_name": "RBAC.DD_token_RBAC.mint",
        "app_key": appsnames.app_key,
        "query_type": "upsert",
        "query_object": {
          "name": "RBAC.DD_token_RBAC.mint",
          "data": {
            "variables": {
              "TOKEN_ID": first_test_token
            },
            "value": {
              "token_ID": first_test_token,
              "app_name": "DD_token_RBAC",
              "version": "0.0.1",
              "nonce": 1,
              "signing_public_key": nip19.npubEncode(public_key),
              "operation_name": "mint",
              "timestamp_ms": Date.now(),
              "operation_data": {
                "amount": 1000000,
                "to_public_key": nip19.npubEncode(public_key)
              }
            }
          }
        }
      }
      const JSON_code = 0x0200
      let encoded = encode(request_data.query_object.data.value)
      let hash = await sha256.digest(encoded)
      let cidv1 = CID.create(1, JSON_code, hash)
      request_data.query_object.data.variables.token_ID = String(cidv1)
      let signedEvent = finalizeEvent({
        kind: 1,
        created_at: Math.floor(Date.now() / 1000),
        tags: [
          ['DD']
        ],
        content:
          JSON.stringify(request_data),
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
        // console.log("fetch_response")
        // console.log(fetch_response)
      } catch (error) {
        assert.equal(true, false, "fetch failed, you need to be running the server to run these tests")
      }
      assert.equal(fetch_response.status == "success", true, `First event was not sucessful \n${JSON.stringify(fetch_response, null, 2)}`)
    })



    it('Transfer a token', async function () {
      let request_data = {
        "app_name": "RBAC.DD_token_RBAC.transfer",
        "app_key": appsnames.app_key,
        "query_type": "upsert",
        "query_object": {
          "name": "RBAC.DD_token_RBAC.transfer",
          "data": {
            "variables": {
              "TOKEN_ID": first_test_token
            },
            "value": {
              "token_ID": first_test_token,
              "app_name": "DD_token_RBAC",
              "version": "0.0.1",
              "nonce": 2,
              "signing_public_key": nip19.npubEncode(public_key),
              "operation_name": "transfer",
              "timestamp_ms": Date.now(),
              "operation_data": {
                "amount": 1000,
                "to_public_key": nip19.npubEncode(public_key2)
              }
            }
          }
        }
      }
      const JSON_code = 0x0200
      let encoded = encode(request_data.query_object.data.value)
      let hash = await sha256.digest(encoded)
      let cidv1 = CID.create(1, JSON_code, hash)
      request_data.query_object.data.variables.token_ID = String(cidv1)
      let signedEvent = finalizeEvent({
        kind: 1,
        created_at: Math.floor(Date.now() / 1000),
        tags: [
          ['DD']
        ],
        content:
          JSON.stringify(request_data),
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
        console.log("fetch_response")
        console.log(fetch_response)
      } catch (error) {
        assert.equal(true, false, "fetch failed, you need to be running the server to run these tests")
      }
      assert.equal(fetch_response.status == "success", true, `First event was not sucessful \n${JSON.stringify(fetch_response, null, 2)}`)
    })

    it("first Balance", async function() {
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "name": "RBAC.DD_token_RBAC.token_balances",
          "data": {
            "variables": {
              TOKEN_ID: first_test_token,
              secp256k1_PUBLIC_KEY: public_key
            }
          }
        })
      };
  
      // Send the POST request
      fetch_response = await fetch("http://localhost:8081/get_balance", options);
      fetch_response = await fetch_response.json()
      console.log("Balence Below")
      console.log(fetch_response)
      assert.equal(fetch_response.value, 1000000 - 1000)
    })


  })
})