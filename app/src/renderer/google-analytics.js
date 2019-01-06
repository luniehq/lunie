/* global ga */
"use strict"

module.exports = function(gaUID) {
  window.ga =
    window.ga ||
    function() {
      ;(ga.q = ga.q || []).push(arguments)
    }
  ga.l = +new Date()
  ga(`create`, gaUID, `auto`)
}
