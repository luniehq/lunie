import config from "../config"
import * as Sentry from "@sentry/browser"

// load firebase async
let firebaseInstance
const getFirebase = async () => {
  if (firebaseInstance) {
    return firebaseInstance
  }
  try {
    const [firebase] = await Promise.all([
      import("firebase/app"),
      import("firebase/auth"),
    ])
    firebase.initializeApp(config.firebaseConfig)
    firebaseInstance = firebase
    return firebase
  } catch (error) {
    console.error(`Firebase could not be initialized`)
    console.error(error)
    Sentry.captureException(error)
  }
}

export default getFirebase
