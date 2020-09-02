"use strict"

export const sleep = function (amount) {
  return new Promise((resolve) => {
    setTimeout(resolve, amount)
  })
}

export const capitalizeFirstLetter = function (string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}
