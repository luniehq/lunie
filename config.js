"use strict"

const fs = require(`fs`)
const path = require(`path`)
const root = require(`app/src/root`)
const toml = require(`toml`)

const readToml = directory =>
  toml.parse(
    fs.readFileSync(path.join(directory, `config.toml`), {
      encoding: `utf8`
    })
  )

// Try to read the configuration file in the root directory first.  If that
// fails then read the one bundled in the application.
try {
  module.exports = readToml(root)
} catch (exception) {
  module.exports = readToml(path.join(`..`, __dirname))
}
