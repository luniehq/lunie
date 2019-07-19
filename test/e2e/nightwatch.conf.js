const seleniumServer = require('selenium-server')
const chromedriver = require('chromedriver')
const SCREENSHOT_PATH = './screenshots/'
const CRX_PATH = require('path').join(__dirname, '../../dist')
// we use a nightwatch.conf.js file so we can include comments and helper functions
module.exports = {
  src_folders: ['test/e2e'],
  output_folder: './reports',
  selenium: {
    start_process: true,
    server_path: seleniumServer.path,
    host: '127.0.0.1',
    port: 4444,
    cli_args: {
      'webdriver.chrome.driver': chromedriver.path
    }
  },
  test_settings: {
    default: {
      screenshots: {
        enabled: true,
        path: SCREENSHOT_PATH
      },
      globals: {
        waitForConditionTimeout: 5000
      },
      desiredCapabilities: {
        browserName: 'chrome',
        "chromeOptions" : {
          "args": [
            `--load-extension=${CRX_PATH}`,
          ]
        }
      }
    }
  }
}

function padLeft(count) {
  return count < 10 ? '0' + count : count.toString()
}

var FILECOUNT = 0
/**
 * The default is to save screenshots to the root of your project even though
 * there is a screenshots path in the config object above! ... so we need a
 * function that returns the correct path for storing our screenshots.
 * While we're at it, we are adding some meta-data to the filename, specifically
 * the Platform/Browser where the test was run and the test (file) name.
 */
function imgpath(browser) {
  var a = browser.options.desiredCapabilities
  var meta = [a.platform]
  meta.push(a.browserName ? a.browserName : 'any')
  meta.push(a.version ? a.version : 'any')
  meta.push(a.name)
  var metadata = meta
    .join('~')
    .toLowerCase()
    .replace(/ /g, '')
  return SCREENSHOT_PATH + metadata + '_' + padLeft(FILECOUNT++) + '_'
}

module.exports.imgpath = imgpath
module.exports.SCREENSHOT_PATH = SCREENSHOT_PATH
