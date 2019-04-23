"use strict"

const childProcess = require(`child_process`)
const path = require(`path`)

// Show the exec commands for easier debugging if something goes wrong.
const execSync = (command, options) => {
  console.log(command)
  childProcess.execSync(command, Object.assign({ stdio: `inherit` }, options))
}

function main() {
  execSync(`
    docker run \
    --mount type=bind,source="${path.resolve(`./nodes/first`)}",target="/mnt" \
    tendermint/gaia:0.34.1 < ./first.sh
  `
  )
}

main()