// Enabling browserstack-automate node integration
require(`browserstack-automate`).Nightwatch()

module.exports = (function(settings) {
  settings.test_workers = false
  return settings
})(require(`./nightwatch.json`))