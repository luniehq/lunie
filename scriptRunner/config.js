const secrets = require('../api/secrets')

module.exports = {
    authenticationToken: process.env.AUTHENTICATION_TOKEN || secrets.read('AUTHENTICATION_TOKEN')
}