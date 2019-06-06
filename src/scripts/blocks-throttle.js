// throttle updates of the store to reduce the amount of requests
// runs once in the beginning and then only runs every x blocks
// initialised with a identifier to reuse the throttle function across multiple actions
export const throttle = name => {
  const throttleName = "throttle_" + name

  // takes a block height diff which should trigger a new update on the data
  // force will always trigger the callback
  return diff => async (state, currentHeight, cb, force) => {
    const updateDiff = currentHeight - state[throttleName]
    if (force || state[throttleName] === undefined || updateDiff >= diff) {
      state[throttleName] = Number(currentHeight)
      await cb()
    }
  }
}
