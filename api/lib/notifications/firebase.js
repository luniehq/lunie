const firebaseAdmin = require('firebase-admin')

const firebaseServiceAccount = require('../../firebaseCredentials.json')
firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(firebaseServiceAccount)
})

module.exports = firebaseAdmin
