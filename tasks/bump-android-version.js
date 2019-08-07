const fs = require("fs")

const gradlePath = "./android/app/build.gradle"

function main() {
  const gradle = fs.readFileSync(gradlePath, "utf8")
  const currentVersion = /versionCode (\d+)/.exec(gradle)[1]
  const newVersion = parseInt(currentVersion) + 1
  const updatedGradle = gradle.replace(
    /versionCode (\d+)/,
    `versionCode ${newVersion}`
  )
  fs.writeFileSync(gradlePath, updatedGradle)

  console.log(`Updated version for Android build to ${newVersion}`)
}

main()
