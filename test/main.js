let test = require('tape-promise/tape')

module.exports = async function main (t) {
  return require('../app/dist/main')
}
