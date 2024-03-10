#!/bin/bash
curl localhost:8081/query \
	-H "Content-Type: application/json" \
	-d @test_curl.json
