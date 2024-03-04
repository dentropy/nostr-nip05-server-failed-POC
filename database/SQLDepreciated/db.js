import sqlite from 'better-sqlite3';
import fs from 'fs';

let schema = await fs.readFileSync('./database/schema.sql', 'utf-8')

let db = new sqlite("./database/db.sqlite");


try {
	console.log("Creating and Validaitng Schema")
	// #TODO
	// console.log(schema)
	await db.exec(schema);
} catch (error) {
    console.error('Error:', error.message);
}

export default db