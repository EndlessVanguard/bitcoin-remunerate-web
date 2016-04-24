#!/bin/sh

node ./node_modules/.bin/standard;

cat src/client.js | \
    sed s/https:\\/\\/api.getmomona.com/localhost:3000/ | \
    node ./node_modules/.bin/uglifyjs --compress --mangle -o "dist/devclient.js";
