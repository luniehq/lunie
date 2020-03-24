const fs = require("fs")

/*
 * Creates a file that holds the current version on the server so the app can check at start if it is outdated.
 */

function main() {
  const { version } = JSON.parse(fs.readFileSync("./package.json"))
  fs.writeFileSync("./public/version.json", `{"version": "${version}"}`, "utf8")
}

main()
