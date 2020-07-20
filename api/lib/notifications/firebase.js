const firebaseAdmin = require('firebase-admin')
const config = require('../config')

const firebaseServiceAccount = require('../../firebaseCredentials.json')
firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(firebaseServiceAccount),
  databaseURL: config.firebaseDatabaseUrl,
})

module.exports = firebaseAdmin
