// make it possible to configure GOPATH in config
try {
  const env = require('../../env.js')
  Object.assign(process.env, env)
} catch (e) {}

const { COSMOS_HOME, NODE_ENV } = process.env
if (COSMOS_HOME) {
  module.exports = COSMOS_HOME
} else {
  const home = require('user-home')
  const { join } = require('path')
  const pkg = require('../package.json')
  const DEV = NODE_ENV === 'development'
  module.exports = join(home, `.${pkg.name}${DEV ? '-dev' : ''}`)
}
