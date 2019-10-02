const fs = require("fs")

const projectFilePath = "./ios/App/App/Info.plist"

function main() {
  const packageJson = JSON.parse(fs.readFileSync("./package.json"))
  const project = fs.readFileSync(projectFilePath, "utf8")
  const currentVersion = /<key>CFBundleVersion<\/key>(\s+)<string>(\d+)<\/string>/.exec(
    project
  )[2]
  const newVersion = parseInt(currentVersion) + 1
  const updatedGradle = project
    .replace(
      /<key>CFBundleVersion<\/key>(\s+)<string>(\d+)<\/string>/,
      `<key>CFBundleVersion</key>$1<string>${newVersion}</string>`
    )
    .replace(
      /<key>CFBundleShortVersionString<\/key>(\s+)<string>(.+)<\/string>/,
      `<key>CFBundleShortVersionString</key>$1<string>${packageJson.version}</string>`
    )
  fs.writeFileSync(projectFilePath, updatedGradle)

  console.log(`Updated version code for iOS build to ${newVersion}`)
}

main()
