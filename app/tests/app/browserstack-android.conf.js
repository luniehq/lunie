exports.config = {
  user: process.env.BROWSERSTACK_USERNAME || "BROWSERSTACK_USERNAME",
  key: process.env.BROWSERSTACK_ACCESS_KEY || "BROWSERSTACK_ACC_KEY",

  updateJob: false,
  // specs: ["./*.spec.js"],
  exclude: [],

  capabilities: [
    {
      name: "single_appium_test",
      build: "webdriver-browserstack",
      device: "Samsung Galaxy S9",
      browserName: "",
      autoWebview: true,
      app: process.env.BROWSERSTACK_APP_URL || "bs://<hashed app-id>",
      "browserstack.debug": true,
    },
  ],

  logLevel: "verbose",
  coloredLogs: true,
  screenshotPath: "./errorShots/",
  baseUrl: "",
  waitforTimeout: 10000,
  connectionRetryTimeout: 90000,
  connectionRetryCount: 3
}
