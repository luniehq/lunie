global.console.error = (...args) => {
  throw new Error(args.join(' '))
}

if (!process.UNHANDLED_REJECTION_LISTENER_ADDED) {
  process.on('unhandledRejection', reason => {
    throw reason
  })
} else {
  process.UNHANDLED_REJECTION_LISTENER_ADDED = true
}

