"use strict"
/**
 * Google analytics gets injected here
 * @module google-analytics
 */

import Analytics from "electron-ga"

module.exports = function(gaUID) {
  const analytics = new Analytics(gaUID)
  window.analytics = analytics
}
