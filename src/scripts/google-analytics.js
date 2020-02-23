/* istanbul ignore file */
/* global ga */
"use strict"
import { store_in_db } from "scripts/db_store"

export const enableGoogleAnalytics = function enableGoogleAnalytics(gaUID) {
  // if set to true disables google analytics
  window[`ga-disable-${gaUID}`] = false

  window.ga =
    window.ga ||
    function() {
      ;(ga.q = ga.q || []).push(arguments)
    }
  ga.l = +new Date()
  anonymize()
  ga(`create`, gaUID, `auto`)
}

export const anonymize = function anonymize(anonymize = true) {
  if (window.ga) {
    ga(`set`, `allowAdFeatures`, !anonymize)
    ga(`set`, `anonymizeIp`, anonymize)
  }
}

export const deanonymize = function deanonymize() {
  anonymize(false)
}

export const disableGoogleAnalytics = function disableGoogleAnalytics(gaUID) {
  // if set to true disables google analytics
  window[`ga-disable-${gaUID}`] = true
}

/*
GA takes parameters like dimension1 or dimension2. This replaces the human readable values with the by GA required values.
*/
function customToNum(custom) {
  const dimensions = {
    network: 1,
    address: 2
  }
  if (typeof dimensions[custom] !== "undefined") {
    return "dimension" + dimensions[custom]
  }
  return false
}

export const sendEvent = function event(customObject, ...args) {
  console.log(customObject)
  if (window.ga) {
    let newKey
    // sending data before converting
    store_in_db(customObject, ...args)
    // converting customObject to ga metrics ids
    Object.keys(customObject).map(key => {
      if ((newKey = customToNum(key))) {
        Object.defineProperty(
          customObject,
          newKey,
          Object.getOwnPropertyDescriptor(customObject, key)
        )
      }
      delete customObject[key]
    })
    window.ga(`send`, `event`, ...args, customObject)
  }
}

export const track = function track(...args) {
  if (window.ga) {
    window.ga(`send`, ...args)
  }
}

export const setGoogleAnalyticsPage = function track(...args) {
  if (window.ga) {
    window.ga(`set`, `page`, ...args)
    window.ga(`send`, `pageview`)
  }
}
