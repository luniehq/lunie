require("browserstack-local")

const nightwatch_config = {
  src_folders: ["tests/e2e"],
  globals_path: "./globals.js",
  output_folder: "./output",
  launch_url: "https://127.0.0.1:9080",

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
        "browserstack.user": process.env.BROWSERSTACK_USERNAME || "",
        "browserstack.key": process.env.BROWSERSTACK_ACCESS_KEY || "",
        "browserstack.debug": true,
        "browserstack.local": true,
        "browserstack.networkLogs": true,
        browser: "chrome",
        resolution: "1920x1080",
        javascriptEnabled: true,
        acceptSslCerts: true,
        loggingPrefs: {
          driver: "INFO",
          server: "OFF",
          browser: "INFO"
        },
        chromeOptions: {
          args: ["disable-web-security", "ignore-certificate-errors"],
          prefs: {
            "intl.accept_languages": "en-US,en"
          }
        }
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
