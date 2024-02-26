
import * as Level from 'abstract-level';

const db = new Level('./database/db.leveldb', { valueEncoding: 'json' })

