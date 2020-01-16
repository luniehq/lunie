const fs = require("fs")

const iosConfigPath = "ios/App/App/capacitor.config.json"
const androidConfigPath = "android/app/src/main/assets/capacitor.config.json"

/*
 * this script adds the required intercom keys to the capacitor configs
 * this is done in this script to avoid checking the keys into GitHub
 */

function main() {
  const intercomAppId = process.argv[2]
  const androidKey = process.argv[3]
  const iosKey = process.argv[4]

  const iosConfig = JSON.parse(fs.readFileSync(iosConfigPath))
  if (!iosConfig.plugins) {
    iosConfigPath.plugins = {}
  }
  iosConfig.plugins.IntercomPlugin = {
    "ios-apiKey": iosKey,
    "ios-appId": intercomAppId
  }
  fs.writeFileSync(iosConfigPath, JSON.stringify(iosConfig))

  const androidConfig = JSON.parse(fs.readFileSync(androidConfigPath))
  if (!androidConfig.plugins) {
    androidConfig.plugins = {}
  }
  androidConfig.plugins.IntercomPlugin = {
    "android-apiKey": androidKey,
    "android-appId": intercomAppId
  }
  fs.writeFileSync(androidConfigPath, JSON.stringify(androidConfig))
}

main()
