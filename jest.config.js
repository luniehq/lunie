module.exports = {
  moduleFileExtensions: ["js", "jsx", "json", "vue"],
  transform: {
    "^.+\\.vue$": "vue-jest",
    ".+\\.(css|styl|less|sass|scss|svg|png|jpg|ttf|woff|woff2)$":
      "jest-transform-stub",
    "^.+\\.jsx?$": "babel-jest"
  },
  transformIgnorePatterns: ["/node_modules/"],
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
    "^modules/(.*)$": `<rootDir>/src/vuex/modules/$1`,
    "^tests/(.*)$": `<rootDir>/tests/$1`,
    "^.+\\.(css)$": "<rootDir>/tests/unit/helpers/emptyModule.js"
  },
  snapshotSerializers: ["jest-serializer-vue"],
  testMatch: [
    "**/tests/unit/**/*.spec.(js|jsx|ts|tsx)|**/__tests__/*.(js|jsx|ts|tsx)"
  ],
  testURL: "http://localhost/",
  watchPlugins: [
    "jest-watch-typeahead/filename",
    "jest-watch-typeahead/testname"
  ],
  setupFiles: [`./tests/unit/helpers/fixed_time.js`, `jest-localstorage-mock`]
}
