#!/bin/sh

ACCESS_TOKEN=$(curl "https://www.googleapis.com/oauth2/v4/token" -d "client_id=${GAPI_CLIENT_ID}&client_secret=${GAPI_CLIENT_SECRET}&refresh_token=${GAPI_REFRESH_TOKEN}&grant_type=refresh_token" | jq -r .access_token)
curl -H "Authorization: Bearer ${ACCESS_TOKEN}" -H "x-goog-api-version: 2" -X PUT -T $1 -v "https://www.googleapis.com/upload/chromewebstore/v1.1/items/${APP_ID}"