const firebaseAdmin = require('./notifications/firebase')
const Sentry = require('@sentry/node')
const database = require('./database')
const config = require('../config')
const { AuthenticationError } = require('apollo-server')
const db = database(config)('')

const registerUser = async (idToken) => {
  try {
    // verify that the submitted tokens is valid
    const { uid } = await firebaseAdmin.auth().verifyIdToken(idToken)
    // get user record, with custom claims and creation & activity dates
    const userRecord = await firebaseAdmin.auth().getUser(uid)
    // we don't store user emails for now
    const user = {
      uid,
      premium: false,
      createdAt: userRecord.metadata.creationTime,
      lastActive: userRecord.metadata.lastSignInTime
    }
    database(config)('').upsert(`users`, user)
    const session = await db.storeAndGetNewSession(uid)

    return {
      validUntil: session.valid_until,
      sessionToken: session.session_token
    }
  } catch (error) {
    console.error(`In storeUser`, error)
    Sentry.withScope(function (scope) {
      scope.setExtra('storeUser resolver')
      Sentry.captureException(error)
    })
  }
}

const sessionCache = {}
async function validateSession(sessionToken) {
  let session
  if (sessionCache[sessionToken]) {
    session = sessionCache[sessionToken]
  } else {
    session = await db.getSession(sessionToken)
    sessionCache[sessionToken] = session
  }
  if (
    !session ||
    new Date(session.valid_until).getTime() - new Date().getTime() <= 0
  ) {
    delete sessionCache[sessionToken]
    throw new AuthenticationError('Session is outdated')
  }

  return session
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
  validateIdToken,
  validateSession
}
