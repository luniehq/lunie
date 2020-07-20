const firebaseAdmin = require('./notifications/firebase')
const Sentry = require('@sentry/node')
const database = require('./database')

const registerUser = async (uid) => {
  try {
    // get user record, with custom claims and creation & activity dates
    const userRecord = await firebaseAdmin.auth().getUser(uid)
    // check if user already exists in DB
    const storedUser = await database(config)('').getUser(uid)
    // check if user already has premium as a custom claim
    if (!userRecord.customClaims) {
      // set premium field
      await firebaseAdmin.auth().setCustomUserClaims(uid, { premium: false })
    }
    // we don't store user emails for now
    const user = {
      uid,
      premium: false,
      createdAt: userRecord.metadata.creationTime,
      lastActive: userRecord.metadata.lastSignInTime
    }
    if (!storedUser) {
      database(config)('').storeUser(user)
    } else {
      database(config)('').upsert(`users`, user)
    }
  } catch (error) {
    console.error(`In storeUser`, error)
    Sentry.withScope(function (scope) {
      scope.setExtra('storeUser resolver')
      Sentry.captureException(error)
    })
  }
}

async function validateIdToken(idToken) {
  try {
    const decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken)
    return {
      uid: decodedToken.uid,
      email: decodedToken.email
    }
  } catch (error) {
    console.error(error)
    Sentry.captureException(error)
    return undefined
  }
}

module.exports = {
  registerUser,
  validateIdToken
}
