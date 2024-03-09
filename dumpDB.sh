#!/bin/bash
node ./database/dump.js > dbDump.ndjson && jq '.' dbDump.ndjson > test2.ndjson && mv test2.ndjson dbDump.ndjson