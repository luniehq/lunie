"use strict"

const fs = require(`fs`)
const path = require(`path`)
const toml = require(`toml`)

module.exports = toml.parse(
  fs.readFileSync(path.join(__dirname, `../config.toml`), {
    encoding: `utf8`
  })
)
