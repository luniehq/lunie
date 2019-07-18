#!/bin/sh

curl -H "Authorization: Bearer ${ACCESS_TOKEN}" -H "x-goog-api-version: 2" -X PUT -T $1 -v "https://www.googleapis.com/upload/chromewebstore/v1.1/items/${APP_ID}"