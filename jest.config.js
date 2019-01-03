"use strict"

module.exports = {
  testMatch: [`**/unit/specs/**/*spec.js`],
  moduleFileExtensions: [`js`, `vue`],
  moduleDirectories: [`app/node_modules`, `node_modules`, `src`],
  moduleNameMapper: {
    "^src/(.*)$": `<rootDir>/app/src/$1`,
    "^app/(.*)$": `<rootDir>/app/$1`,
    "^renderer/(.*)$": `<rootDir>/app/src/renderer/$1`,
    "^assets/(.*)$": `<rootDir>/app/src/renderer/assets/$1`,
    "^common/(.*)$": `<rootDir>/app/src/renderer/components/common/$1`,
    "^transactions/(.*)$": `<rootDir>/app/src/renderer/components/transactions/$1`,
    "^govern/(.*)$": `<rootDir>/app/src/renderer/components/govern/$1`,
    "^monitor/(.*)$": `<rootDir>/app/src/renderer/components/monitor/$1`,
    "^staking/(.*)$": `<rootDir>/app/src/renderer/components/staking/$1`,
    "^scripts/(.*)$": `<rootDir>/app/src/renderer/scripts/$1`,
    "^wallet/(.*)$": `<rootDir>/app/src/renderer/components/wallet/$1`,
    "^modules/(.*)$": `<rootDir>/app/src/renderer/vuex/modules/$1`
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
    `/app/src/config.js`
  ],
  testURL: `http://localhost`,
  setupFiles: [
    `./test/unit/helpers/fixed_time.js`,
    `./test/unit/helpers/console_error_throw.js`,
    `./test/unit/helpers/genesis_mock.js`,
    `./test/unit/helpers/electron_mock.js`,
    `./test/unit/helpers/sentry_mock.js`,
    `./test/unit/helpers/mock_perfect-scrollbar.js`,
    `./test/unit/helpers/window_mock.js`,
    `jest-localstorage-mock`
  ]
}
