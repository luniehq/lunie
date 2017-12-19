global.console.error = (...args) => {
  throw new Error(args.join(' '))
}
