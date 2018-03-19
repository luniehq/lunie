// disable log output in tests
console.log = () => {}
console.info = () => {}

if (!process.env.LISTENING_TO_UNHANDLED_REJECTION) {
  process.on('unhandledRejection', reason => {
    throw reason
  })
  // Avoid memory leak by adding too many listeners
  process.env.LISTENING_TO_UNHANDLED_REJECTION = true
}

console.error = (...args) => {
  throw Error(args.join(' '))
}

console.warn = (...args) => {
  throw Error(args.join(' '))
}
