const { join } = require('path')
const home = require('user-home')
const pkg = require('../package.json')
const DEV = process.env.NODE_ENV === 'development'
module.exports = join(home, `.${pkg.name}${DEV ? '-dev' : ''}`)
