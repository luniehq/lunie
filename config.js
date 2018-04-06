"use strict"

const path = require("path")
const fs = require("fs")
const toml = require("toml")

module.exports = (function() {
  let configPath = fs.existsSync(path.join(__dirname, `config.toml`))
    ? path.join(__dirname, `config.toml`)
    : path.join(__dirname, "app", `config.toml`)
  console.log(configPath)
  let config = toml.parse(
    fs.readFileSync(configPath, {
      encoding: `utf8`
    })
  )

  // electron-packager options
  // Docs: https://simulatedgreg.gitbooks.io/electron-vue/content/docs/building_your_app.html
  config.building = {
    name: config.name,
    arch: "x64",
    asar: false,
    dir: path.join(__dirname, "app"),
    icon: path.join(__dirname, "app/icons/icon"),
    ignore: /^\/(src|index\.ejs|icons)/,
    out: path.join(__dirname, "builds"),
    overwrite: true,
    packageManager: "yarn"
  }

  return config
})()
