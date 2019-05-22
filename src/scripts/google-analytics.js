/* istanbul ignore file */
/* global ga */
"use strict"

module.exports.enableGoogleAnalytics = function enableGoogleAnalytics(gaUID) {
  // if set to true disables google analytics
  window[`ga-disable-${gaUID}`] = false

  window.ga =
    window.ga ||
    function() {
      ;(ga.q = ga.q || []).push(arguments)
    }
  ga.l = +new Date()
  module.exports.anonymize()
  ga(`create`, gaUID, `auto`)
}

module.exports.anonymize = function anonymize(anonymize = true) {
  if (window.ga) {
    ga(`set`, `allowAdFeatures`, !anonymize)
    ga(`set`, `anonymizeIp`, anonymize)
  }
}

module.exports.deanonymize = function deanonymize() {
  module.exports.anonymize(false)
}

module.exports.disableGoogleAnalytics = function disableGoogleAnalytics(gaUID) {
  // if set to true disables google analytics
  window[`ga-disable-${gaUID}`] = true
}

module.exports.track = function track(...args) {
  if (window.ga) {
    window.ga(`send`, ...args)
  }
}

module.exports.setGoogleAnalyticsPage = function track(...args) {
  if (window.ga) {
    window.ga(`set`, `page`, ...args)
    window.ga('send', 'pageview');
  }
}
