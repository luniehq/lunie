'use strict'
module.exports = {
  testMatch: [`<rootDir>/test/unit/**/*spec.js`],
  transform: {
    '^.+\\.(js|jsx)?$': `<rootDir>/node_modules/babel-jest`,
    '.*\\.vue$': `<rootDir>/node_modules/vue-jest`
  },
  moduleFileExtensions: [`js`, `vue`],
  transformIgnorePatterns: [`node_modules`],
  testPathIgnorePatterns: [`/node_modules/`, `<rootDir>/lunie`]
}
