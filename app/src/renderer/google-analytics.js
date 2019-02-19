/* istanbul ignore file */
/* global ga */
"use strict"

module.exports.enableGoogleAnalytics = function enableGoogleAnalytics(gaUID) {
  // if set to true disables google analytics
  window[`ga-disable-${gaUID}`] = false

  window.ga =
    window.ga ||
    function() {
      (ga.q = ga.q || []).push(arguments)
    }
  ga.l = +new Date()
  ga(`create`, gaUID, `auto`)
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
