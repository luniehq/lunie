module.exports = {
  /**
     * After all the tests are run, evaluate if there were errors and exit appropriately.
     *
     * If there were failures or errors, exit 1, else exit 0.
     *
     * @param results
     */
  reporter: function(results) {
    if ((typeof(results.failed) === `undefined` || results.failed === 0) &&
        (typeof(results.error) === `undefined` || results.error === 0)) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  }
};