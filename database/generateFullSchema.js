import { Level } from 'level';
import { level_schema } from "../database/levelSchema.js";
import fs from "fs";



async function main(){
    const level_db = new Level('./database/db.leveldb', { valueEncoding: 'json' })
    const dddb = level_db.sublevel('ddaemon', { valueEncoding: 'json' })
    let db_schema = await level_schema(dddb)
    console.log(db_schema)
    await fs.writeFileSync("./database/fullSchema.json", JSON.stringify(db_schema, null, 2))

}

main()
