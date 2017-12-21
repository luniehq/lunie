global.console.error = (...args) => {
  throw new Error(args.join(' '))
}
process.on('unhandledRejection', reason => {
  throw reason
})
