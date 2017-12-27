global.console.error = (...args) => {
  // throwing an error from console.error could be catched by Vue
  // by throwing it inside an error it will be catched by our unhandledRejection listener
  return new Promise(() => {
    throw new Error('Console Error: ' + args.join(' '))
  })
}

if (!process.env.LISTENING_TO_UNHANDLED_REJECTION) {
  process.on('unhandledRejection', reason => {
    throw reason
  })
  // Avoid memory leak by adding too many listeners
  process.env.LISTENING_TO_UNHANDLED_REJECTION = true
}

