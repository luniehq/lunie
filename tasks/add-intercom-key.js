/*
 * this script adds the required intercom keys to the capacitor config
 * this is done in this script to avoid checking the keys into GitHub
 *
 * Usage:
 *
 * node tasks/add-intercom-key.js INTERCOM_APP_ID INTERCOM_ANDROID_KEY INTERCOM_IOS_KEY
 *
 */

const fs = require("fs")

const capacitorConfigPath = "capacitor.config.json"

function main() {
  const intercomAppId = process.argv[2]
  const androidKey = process.argv[3]
  const iosKey = process.argv[4]

  const capacitorConfig = JSON.parse(fs.readFileSync(capacitorConfigPath))

  if (!capacitorConfig.plugins) {
    capacitorConfigPath.plugins = {}
  }

  capacitorConfig.plugins.IntercomPlugin = {
    "android-apiKey": androidKey,
    "android-appId": intercomAppId,
    "ios-apiKey": iosKey,
    "ios-appId": intercomAppId
  }

  fs.writeFileSync(
    capacitorConfigPath,
    JSON.stringify(capacitorConfig, null, 2)
  )
}

main()
