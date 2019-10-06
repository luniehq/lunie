const fs = require("fs")

const projectFilePath = "./ios/App/App/Info.plist"

function main() {
  const packageJson = JSON.parse(fs.readFileSync("./package.json"))
  const firstVersionPart = packageJson.version.substring(0, 4)
  const secondVersionPart = packageJson.version.substring(11, 14)
  const project = fs.readFileSync(projectFilePath, "utf8")
  const currentVersion = /<key>CFBundleVersion<\/key>(\s+)<string>(\d+)<\/string>/.exec(
    project
  )[2]
  const newVersion = parseInt(currentVersion) + 1
  const updatedPlist = project
    .replace(
      /<key>CFBundleVersion<\/key>(\s+)<string>(\d+)<\/string>/,
      `<key>CFBundleVersion</key>$1<string>${newVersion}</string>`
    )
    .replace(
      /<key>CFBundleShortVersionString<\/key>(\s+)<string>(.+)<\/string>/,
      `<key>CFBundleShortVersionString</key>$1<string>${firstVersionPart}${secondVersionPart}</string>`
    )
  fs.writeFileSync(projectFilePath, updatedPlist)

  console.log(`Updated version code for iOS build to ${newVersion}`)
}

main()
