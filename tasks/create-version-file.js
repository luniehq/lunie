const fs = require("fs")

function main() {
  const { version } = JSON.parse(fs.readFileSync("./package.json"))
  fs.writeFileSync("./dist/version.json", `{"version": "${version}"}`, "utf8")
}

main()
