/*
 * this script extracts the fragment types from the api schema
 *
 * this is needed to use union types (i.e: used in TransactionV2 type)
 * in apollo client
 *
 * we need to run this script every time we add or update a union type
 * in api schema
 *
 * Reference:
 *
 * https://www.apollographql.com/docs/react/data/fragments/#fragments-on-unions-and-interfaces
 *
 * Usage:
 *
 * node tasks/extract-fragment-types.js
 *
 */

const fetch = require("node-fetch")
const fs = require("fs")

// Local api
const YOUR_API_HOST = "http://localhost:4000"

fetch(`${YOUR_API_HOST}/graphql`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    variables: {},
    query: `
      {
        __schema {
          types {
            kind
            name
            possibleTypes {
              name
            }
          }
        }
      }
    `
  })
})
  .then(result => result.json())
  .then(result => {
    // here we're filtering out any type information unrelated to unions or interfaces
    const filteredData = result.data.__schema.types.filter(
      type => type.possibleTypes !== null
    )
    result.data.__schema.types = filteredData;
    fs.writeFile("./fragmentTypes.json", JSON.stringify(result.data), err => {
      if (err) {
        console.error("Error writing fragmentTypes file", err)
      } else {
        console.log("Fragment types successfully extracted!")
      }
    })
  })