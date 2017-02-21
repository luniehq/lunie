const files = require.context('.', false, /\.js$/)
const funcs = {}
files.keys().forEach((key) => {
  if (key === './index.js') return
  funcs[key.replace(/(\.\/|\.js)/g, '')] = files(key).default
})

export default (opts) => {
  const modules = {}
  for (let key in funcs) {
    modules[key] = funcs[key](opts)
  }
  return modules
}
