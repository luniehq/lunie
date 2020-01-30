const fs = require("fs")

const { version } = JSON.parse(fs.readFileSync("package.json"))
const appVersion = version

function main() {
  const { version } = JSON.parse(fs.readFileSync("dist/version.json"))
  if (appVersion !== version) {
    console.log('BAD')
    return false
  } else {
    console.log('ALL GOOD')    
  }
}

module.exports = main