export const extend = (target, source) => {
  for (let key in source) {
    target[key] = source[key]
  }
  return target
}
