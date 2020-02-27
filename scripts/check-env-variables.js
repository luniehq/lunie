// check if LUNIE_API value has been set
if (!process.env.LUNIE_API) {
  throw new Error(
    `Cannot build extension without the environmental variable LUNIE_API set`
  )
} else if (!process.env.EXTENSION || process.env.EXTENSION !== `true`) {
  throw new Error(
    `Cannot build extension without the environmental variable EXTENSION set to true`
  )
}
