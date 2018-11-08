"use strict"

if (!process.env.LISTENING_TO_UNHANDLED_REJECTION) {
  process.on(`unhandledRejection`, reason => {
    throw reason
  })
  // Avoid memory leak by adding too many listeners
  process.env.LISTENING_TO_UNHANDLED_REJECTION = true
}

const originalError = global.console.error
const originalWarn = global.console.warn
global.console.error = (...args) => {
  originalError(...args)
  if (process.env.CI) fail(`console.error: ${args}`)
}
global.console.warn = (...args) => {
  originalWarn(...args)
  if (process.env.CI) fail(`console.warn: ${args}`)
}
