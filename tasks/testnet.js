let runDev = require("./runner.js")

async function main() {
  const network = process.argv[2] || "gaia-5000"

  // run Voyager in a development environment
  runDev(`./app/networks/${network}/`)
}

main().catch(function(err) {
  console.error("Starting the application failed", err)
})
