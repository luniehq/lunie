const fs = require("fs")

const gradlePath = "./android/app/build.gradle"

function main() {
  const packageJson = JSON.parse(fs.readFileSync("./package.json"))
  const gradle = fs.readFileSync(gradlePath, "utf8")
  const currentVersion = /versionCode (\d+)/.exec(gradle)[1]
  const newVersion = parseInt(currentVersion) + 1
  const updatedGradle = gradle
    .replace(
        /versionCode (\d+)/,
        `versionCode ${newVersion}`
    )
    .replace(
        /versionName "(.+)"/,
        `versionName "${packageJson.version}"`
    )
  fs.writeFileSync(gradlePath, updatedGradle)

  console.log(`Updated version code for Android build to ${newVersion}`)
}

main()
