var browserstack = require("browserstack-local")

const nightwatch_config = {
  src_folders: ["./test/e2e/"],
  globals_path: "./globals.js",
  launch_url: "https://bs-local.com:9080",

  selenium: {
    start_process: false,
    host: "hub-cloud.browserstack.com",
    port: 80
  },

  test_settings: {
    default: {
      filter: ["*.spec.js"],
      desiredCapabilities: {
        build: "nightwatch-browserstack",
        "browserstack.user":
          process.env.BROWSERSTACK_USERNAME || "BROWSERSTACK_USERNAME",
        "browserstack.key":
          process.env.BROWSERSTACK_ACCESS_KEY || "BROWSERSTACK_ACCESS_KEY",
        "browserstack.debug": true,
        "browserstack.local": true,
        browser: "chrome",
        acceptSslCerts: true
      }
    }
  }
}

// Code to copy seleniumhost/port into test settings
for (var i in nightwatch_config.test_settings) {
  var config = nightwatch_config.test_settings[i]
  config["selenium_host"] = nightwatch_config.selenium.host
  config["selenium_port"] = nightwatch_config.selenium.port
}

module.exports = nightwatch_config
