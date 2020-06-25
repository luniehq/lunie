import config from "../config"

// load firebase async
let firebaseInstance
const getFirebase = async () => {
    if (firebaseInstance) {
        return firebaseInstance
    }
    const [firebase] = await Promise.all([
        import("firebase/app"),
        import("firebase/auth")
    ])
    firebase.initializeApp(config.firebaseConfig)
    firebaseInstance = firebase
    return firebase
}


export default getFirebase
