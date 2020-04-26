"use strict"

export const sleep = function(amount) {
  return new Promise(resolve => {
    setTimeout(resolve, amount)
  })
}
