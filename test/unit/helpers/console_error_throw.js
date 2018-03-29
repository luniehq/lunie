if (!process.env.LISTENING_TO_UNHANDLED_REJECTION) {
  process.on('unhandledRejection', reason => {
    throw reason
  })
  // Avoid memory leak by adding too many listeners
  process.env.LISTENING_TO_UNHANDLED_REJECTION = true
}

const consoleError = console.error
console.error = (...args) => {
  consoleError(...args)
  throw Error('There was an error printed so there is probably a bug in your code.')
}

const consoleWarn = console.warn
console.warn = (...args) => {
  consoleWarn(...args)
  throw Error('There was a warning printed so there is probably a bug in your code.')
}
