'use strict'
module.exports = {
  verbose: true,
  testMatch: [`<rootDir>/test/unit/**/*spec.js`],
  transform: {
    '^.+\\.(js|jsx)?$': `<rootDir>/node_modules/babel-jest`,
    '.*\\.vue$': `<rootDir>/node_modules/vue-jest`
  },
  moduleFileExtensions: [`js`, `vue`],
  moduleDirectories: ['node_modules', 'src'],
  modulePaths: [
    `<rootDir>/lunie`,
    `<rootDir>/lunie/src`,
    `<rootDir>/lunie/src/components`,
    `<rootDir>/lunie/src/filters`,
    `<rootDir>/lunie/src/connectors`,
    `<rootDir>/lunie/src/directives`,
    `<rootDir>/lunie/src/scripts`,
    `<rootDir>/lunie/src/utils`
  ],
  transformIgnorePatterns: [`node_modules`],
  testPathIgnorePatterns: [`/node_modules/`, `<rootDir>/lunie`],
  coverageDirectory: `./test/unit/coverage`,
  coverageReporters: [`lcov`, `text-summary`],
  coveragePathIgnorePatterns: [
    `<rootDir>/node_modules/`,
    `<rootDir>/dist/`,
    `<rootDir>/test/`,
    `<rootDir>/lunie`
  ]
}
