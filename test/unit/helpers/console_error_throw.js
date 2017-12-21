global.console.error = (...args) => {
  throw new Error(args.join(' '))
}

if (!process.env.LISTENING_TO_UNHANDLED_REJECTION) {
  process.on('unhandledRejection', reason => {
    throw reason
  })
  // Avoid memory leak by adding too many listeners
  process.env.LISTENING_TO_UNHANDLED_REJECTION = true
}

