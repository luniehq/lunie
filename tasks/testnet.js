let runDev = require("./runner.js")
let config = require("../app/src/config.js")

async function main() {
  const network = process.argv[2] || config.default_network

  // run Voyager in a development environment
  runDev(`./builds/testnets/${network}/`)
}

main().catch(function(err) {
  console.error("Starting the application failed", err)
})
