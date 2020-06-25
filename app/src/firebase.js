import config from "../config"

// load firebase async
let firebaseInstance
const getFirebase = async () => {
    if (firebaseInstance) {
        return firebaseInstance
    }
try {
    const [firebase] = await Promise.all([
        import("firebase/app"),
        import("firebase/auth")
    ])
    firebase.initializeApp(config.firebaseConfig)
    firebaseInstance = firebase
    return firebase
 } catch (error) {
   console.error(`Firebase could not be initialized`)
   Sentry.captureException(error) // needs to be imported in an async way ✌️ 
 }
}


export default getFirebase
