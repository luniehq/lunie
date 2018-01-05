const { COSMOS_HOME, NODE_ENV } = process.env
if (COSMOS_HOME) {
  module.exports = COSMOS_HOME
} else {
  let home = require('user-home')
  const { join } = require('path')
  const pkg = require('../package.json')
  const DEV = NODE_ENV === 'development'

  // On Windows we get an EPERM error writing in the user dir so we switch to the alowed AppData dir
  const win = /win/.test(process.platform)
  if (win) {
    home = join(home, 'AppData/Local')
  }
  module.exports = join(home, `.${pkg.name}${DEV ? '-dev' : ''}`)
}
