#!/bin/sh

node ./node_modules/.bin/standard

./node_modules/.bin/standard

./node_modules/.bin/uglifyjs src/client.js --compress --mangle -o dist/client.js

cat dist/client.js | \
    sed s,https:\\/\\/api.getmomona.com,http:\/\/localhost:3000, > dist/devclient.js
