const CRX_PATH = require('path').join(__dirname, '../../dist')

module.exports = {
  CRX_PATH: CRX_PATH,
  EXTENSION_ID: 'cklkpejioojjeiigffappdlcmnonmjek',
  signupData: {
    name: "Thanos Account",
    password: "Gamora1234",
    seedPhrase: "release endorse scale across absurd trouble climb unaware actor elite fantasy chair license word rare length business kiss smoke tackle report february bid ginger"
  },
  launchOptions: { 
    headless: false,
    slowMo: 5,
    args: [
      `--disable-extensions-except=${CRX_PATH}`,
      `--load-extension=${CRX_PATH}`
    ]
  }

}
