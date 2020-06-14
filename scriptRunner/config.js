const secrets = require('../api/secrets')

module.exports = {
    authenticationToken: secrets.read('AUTHENTICATION_TOKEN') || process.env.AUTHENTICATION_TOKEN
}