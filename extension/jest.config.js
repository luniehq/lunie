'use strict'
module.exports = {
  verbose: true,
  testMatch: [`<rootDir>/test/unit/**/*spec.js`],
  transform: {
    '.*\\.vue$': `vue-jest`,
    '^.+\\.(js|jsx)?$': `babel-jest`
  },
  moduleFileExtensions: [`js`, `vue`],
  moduleDirectories: ['node_modules', 'src'],
  modulePaths: [
    `<rootDir>/../app`,
    `<rootDir>/../app/src`,
    `<rootDir>/../app/src/components`,
    `<rootDir>/../app/src/filters`,
    `<rootDir>/../app/src/connectors`,
    `<rootDir>/../app/src/directives`,
    `<rootDir>/../app/src/scripts`,
    `<rootDir>/../app/src/utils`
  ],
  transformIgnorePatterns: [`node_modules`],
  testPathIgnorePatterns: [`/node_modules/`, `<rootDir>/../app`],
  coverageDirectory: `./test/unit/coverage`,
  coverageReporters: [`lcov`, `text-summary`],
  coveragePathIgnorePatterns: [
    `<rootDir>/node_modules/`,
    `<rootDir>/dist/`,
    `<rootDir>/test/`,
    `<rootDir>/../app`
  ]
}
