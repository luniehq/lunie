module.exports = function() {
  return {
    files: ["app/src/main/gaiaLite.js"],

    tests: ["test/unit/specs/gaiaLite.spec.js"],

    env: {
      type: "node",
      runner: "node"
    },

    testFramework: "jest"
  }
}
