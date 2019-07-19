const CRX_PATH = require('path').join(__dirname, '../../dist')
const chromedriver = require('chromedriver')

module.exports = {
  src_folders: ['test/e2e'],
  output_folder: './reports',
  filter: ['*.spec.js'],
  test_settings: {
    default: {
      webdriver: {
        start_process: true,
        server_path: chromedriver.path,
        port: 4444,
        cli_args: ['--port=4444']
      },
      desiredCapabilities: {
        browserName: 'chrome',
        javascriptEnabled: true,
        acceptSslCerts: true,
        chromeOptions: {
          args: [
            `--load-extension=${CRX_PATH}`,
            "window-position=2560,0",
            "window-size=1000,700"
          ]
        }
      }
    },
    chrome: {
      webdriver: {
        server_path: chromedriver.path
      },
      desiredCapabilities: {
        browserName: 'chrome',
        javascriptEnabled: true,
        acceptSslCerts: true,
        chromeOptions: {
          args: []
        }
      }
    }
  },
  globals: {
    EXTENSION_ID: 'cklkpejioojjeiigffappdlcmnonmjek'
  }
}