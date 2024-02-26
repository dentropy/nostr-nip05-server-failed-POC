import db from './database/db.js'
import express from 'express';
import * as jq from 'node-jq';

// Nostr specific imports
import * as nip19 from 'nostr-tools/nip19';
import { generateSecretKey, getPublicKey } from 'nostr-tools/pure';

// import dotenv from 'dotenv';
// let dotenv_config = dotenv.config()

var app = express();
app.use(express.urlencoded({extended: true}));
app.use(express.json()) 


async function setup(){
    // Check for Nostr public key to put in admin_t table

    // Troubleshooting Code
    // console.log(process.env)
    // console.log( JSON.stringify(Object.keys(process.env), null, 2 ))
    // console.log(process.env.NOSTR_ADMIN_PUBLIC_KEY)
    // console.log(`process.env.NOSTR_ADMIN_PUBLIC_KEY = ${process.env.NOSTR_ADMIN_PUBLIC_KEY}`)
    if(process.env.NOSTR_ADMIN_PUBLIC_KEY == undefined || process.env.NOSTR_ADMIN_PUBLIC_KEY == ''){
        console.log("\nPlease set environment variable NOSTR_ADMIN_PUBLIC_KEY to a nostr public key")
        process.exit(1);
    }
    if(process.env.NOSTR_ADMIN_PUBLIC_KEY.slice(0, 4) == 'nsec'){
        console.log("\nBro that is your private key let's not do that, get npub not nsec")
        process.exit(1);
    }
    if(process.env.NOSTR_ADMIN_PUBLIC_KEY.slice(0, 4) == 'npub'){
        let testme = nip19.decode(process.env.NOSTR_ADMIN_PUBLIC_KEY)
        try {
            getPublicKey(testme.data)
        } catch (error) {
            console.log("\nInvalid npub key stored in $NOSTR_ADMIN_PUBLIC_KEY environment variable")
            process.exit(1);
        }
    }
    console.log(`NOSTR_ADMIN_PUBLIC_KEY = ${process.env.NOSTR_ADMIN_PUBLIC_KEY}`)


    if(process.env.NOSTR_DNS_NAME == undefined || process.env.NOSTR_DNS_NAME == ''){
        console.log("\nEnvironment Variable $NOSTR_DNS_NAME not set, you can set this up later via the API, see docs")
    }
    else {
        let dns_name = process.env.NOSTR_DNS_NAME.toLowerCase();
        console.log(`dns_name = ${dns_name}`)
        let select_result = await db.prepare(`
            SELECT count(*) as count FROM dns_names_t WHERE dns_name = ?`
            ).get(dns_name);
        if( select_result.count == 0 ){
            let inset_values = {
                dns_name : dns_name,
                share : 1,
                is_configured : 1
            }
            const insert_statement = await db.prepare(`
                INSERT INTO dns_names_t 
                    (
                        dns_name,
                        share,
                        is_configured) 
                VALUES 
                    (
                        @dns_name, 
                        @share,
                        @is_configured
                    )`);
            await insert_statement.run(inset_values);
        }
    }

    // Add in inital data to nostr_jq_json_changes_t
    let query  = await db.prepare(`
        SELECT COUNT(*) as count FROM nostr_jq_json_changes_t;
    `).all();
    if (query[0].count == 0) {
        let jq_command = '{"names":{},"relays":{}}'
        let resulting_raw_json = await jq.run('.', jq_command, { input: 'string' })
        let inset_values = {
            jq_command : jq_command,
            resulting_raw_json : resulting_raw_json
        }
        const insert_statement = db.prepare(`
            INSERT INTO nostr_jq_json_changes_t 
                (
                    jq_command,
                    resulting_raw_json
                ) 
            VALUES 
                (
                    @jq_command,
                    @resulting_raw_json
                )`
        );
        insert_statement.run(inset_values);
    }
    // jq.run('.', '{ foo: "bar" }', { input: 'string' }).
}
setup()

app.get('/', (req, res) => {
    res.send("Hello, World! This is a GET request. <a href='/.well-known/nostr.json'>Well Known</a>");
});


app.get('/.well-known/nostr.json', async (req, res) => {
    let select_result = await db.prepare(`
        SELECT resulting_raw_json FROM nostr_jq_json_changes_t ORDER BY jq_change_id DESC LIMIT 1`
    ).get()
    res.json( JSON.parse( select_result.resulting_raw_json ));
});

app.post('/admin', async function (req, res) {
    // Validate that that message is sigend
    // * Set records manually via jq
    // Get all DNS names
    // * Add, or deactivate DNS names
    // * Add nostr identities
    // * [[CRUD]] coupon codes
    // * [[CRUD]] pricing
    // * NLBits configures (LATER)

    console.log(req.body)
    try {
        // Actually do or calculate something
        console.log(req.body)
        res.send(req.body)
    } catch (err){
      res.send(err)
    }
})

app.post('/coupon', async function (req, res) {
    // Check if coupon code if valid and what domains it supports
    // Claim coupon code


    console.log("\n\n")
    console.log("Request to /coupon")
    console.log(req.body)
    try {
        // Actually do or calculate something
        console.log(req.body)
        res.send(req.body)
    } catch (err){
      res.send(err)
    }
})


app.post('/update', async function (req, res) {
    // Set relays as a list
    // This should also be doable via a nostr message to the server #TODO


    console.log("\n\n")
    console.log("Request to /update")
    console.log(req.body)
    try {
        // Actually do or calculate something
        console.log(req.body)
        res.send(req.body)
    } catch (err){
      res.send(err)
    }
})

app.post('/purchase', async function (req, res) {
    // Not implimented should produce an error


    console.log("\n\n")
    console.log("Request to /purchase")
    console.log(req.body)
    try {
        res.send(req.body)
    } catch (err){
      res.send(err)
    }
})

var server = app.listen(8081, function () {
    var host = server.address().address
    var port = server.address().port
    console.log("\n\nExample app listening at http://%s:%s", host, port)
 })