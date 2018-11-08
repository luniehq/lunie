"use strict"

/* eslint-env jasmine */

if (!process.env.LISTENING_TO_UNHANDLED_REJECTION) {
  process.on(`unhandledRejection`, reason => {
    throw reason
  })
  // Avoid memory leak by adding too many listeners
  process.env.LISTENING_TO_UNHANDLED_REJECTION = true
}

if (!process.env.ALLOW_CONSOLE) {
  const originalError = global.console.error
  const originalWarn = global.console.warn
  global.console.error = (...args) => {
    originalError(...args)
    fail(
      `console.error: ${args}, run with ALLOW_CONSOLE=true to show the console.error without failing `
    )
  }
  global.console.warn = (...args) => {
    originalWarn(...args)
    fail(
      `console.warn: ${args}, run with ALLOW_CONSOLE=true to show the console.warn without failing`
    )
  }
}
