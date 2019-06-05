"use strict"

module.exports = {
  testMatch: [`**/unit/specs/**/*spec.js`],
  moduleFileExtensions: [`js`, `vue`],
  moduleDirectories: [`node_modules`, `src`],
  moduleNameMapper: {
    "^src/(.*)$": `<rootDir>/src/$1`,
    "^assets/(.*)$": `<rootDir>/src/assets/$1`,
    "^common/(.*)$": `<rootDir>/src/components/common/$1`,
    "^transactions/(.*)$": `<rootDir>/src/components/transactions/$1`,
    "^governance/(.*)$": `<rootDir>/src/components/governance/$1`,
    "^monitor/(.*)$": `<rootDir>/src/components/monitor/$1`,
    "^staking/(.*)$": `<rootDir>/src/components/staking/$1`,
    "^scripts/(.*)$": `<rootDir>/src/scripts/$1`,
    "^wallet/(.*)$": `<rootDir>/src/components/wallet/$1`,
    "^modules/(.*)$": `<rootDir>/src/vuex/modules/$1`
  },

  transform: {
    ".*\\.js$": `<rootDir>/node_modules/babel-jest`,
    ".*\\.vue$": `<rootDir>/node_modules/vue-jest`
  },

  transformIgnorePatterns: [`node_modules`],

  collectCoverage: true,
  coverageDirectory: `./test/unit/coverage`,
  coverageReporters: [`lcov`],
  coveragePathIgnorePatterns: [
    `/node_modules/`,
    `/build/`,
    `/dist/`,
    `/test/`,
    `/src/config.js`
  ],
  testURL: `http://localhost`,
  setupFiles: [
    `./test/unit/helpers/fixed_time.js`,
    // `./test/unit/helpers/console_error_throw.js`,
    `./test/unit/helpers/sentry_mock.js`,
    `./test/unit/helpers/mock_perfect-scrollbar.js`,
    `./test/unit/helpers/window_mock.js`,
    `./test/unit/helpers/libs_mock.js`,
    `jest-localstorage-mock`
  ]
}
