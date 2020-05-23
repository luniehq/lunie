exports.config = {
    user: process.env.BROWSERSTACK_USERNAME || 'BROWSERSTACK_USERNAME',
    key: process.env.BROWSERSTACK_ACCESS_KEY || 'BROWSERSTACK_ACC_KEY',
  
    updateJob: false,
    specs: [
      './tests/specs/single_test.js'
    ],
    exclude: [],
  
    maxInstances: 10,
    commonCapabilities: {
      name: 'parallel_appium_test',
      build: 'webdriver-browserstack',
      browserName: 'android',
      app: process.env.BROWSERSTACK_APP_ID || 'bs://<hashed app-id>',
      'browserstack.debug': true
    },
  
    capabilities: [{
      device: 'Google Pixel 2'
    }],
  
    logLevel: 'verbose',
    coloredLogs: true,
    screenshotPath: './errorShots/',
    baseUrl: '',
    waitforTimeout: 10000,
    connectionRetryTimeout: 90000,
    connectionRetryCount: 3,
  
    framework: 'mocha',
    mochaOpts: {
      ui: 'bdd',
      timeout: 20000
    }
  };
  
  // Code to support common capabilities
  exports.config.capabilities.forEach(function(caps){
    for(var i in exports.config.commonCapabilities) caps[i] = caps[i] || exports.config.commonCapabilities[i];
  });