import firebase from "firebase"
import config from "../../../config"

let messaging

const initializeFirebase = () => {
  // TODO ENV like Lunie-API with absolute path
  var firebaseConfig = {
    apiKey: "AIzaSyCrA4mq9v926h3aX9mfkLlzUSRbjFude14",
    authDomain: "lunie-push-notifications.firebaseapp.com",
    databaseURL: "https://lunie-push-notifications.firebaseio.com",
    projectId: "lunie-push-notifications",
    storageBucket: "lunie-push-notifications.appspot.com",
    messagingSenderId: "783884833065",
    appId: "1:783884833065:web:ea02768959989b9218a738",
    measurementId: "G-S3JEYPBQWB"
  }

  firebase.initializeApp(firebaseConfig)

  messaging = firebase.messaging()
  // TODO ENV
  messaging.usePublicVapidKey(
    "BC_2HRHQW9erg_lOd-dFe_R2ISeiXi0qPNqNcL-jBDnsmMXkqnFcBpXqIklsJtkDPiBmSoOlAMDMOyZMt_Njugo"
  )
}

const askPermissionAndRegister = async activeNetworks => {
  const permission = await Notification.requestPermission()
  if (permission === "granted") {
    console.log("Notification permission granted.")

    const token = await messaging.getToken()

    await registerDevice(token, activeNetworks)
  } else {
    console.log("Unable to get permission to notify.")
  }
}

const registerDevice = async (token, activeNetworks) => {
  const registrationResponse = await fetch(`${config.graphqlHost}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      query:
        "mutation ($token: String!, $activeNetworks: String!, $topics: [String]) { registerDevice(token: $token, activeNetworks: $activeNetworks, topics: $topics) { topics } } ",
      variables: {
        token,
        activeNetworks: JSON.stringify(activeNetworks)
      }
    })
  })

  if (registrationResponse.status === 200 && registrationResponse.ok) {
    localStorage.setItem("registration-push-notifications", "true")
  }
}

/**
 * Retrieve active networks from localstorage via session keys
 *
 * @param {[ Object ]} networks
 * @param network.id network identifier such as "cosmos-hub-testnet"
 */
const getActiveNetworks = networks => {
  let activeNetworks = []
  networks.forEach(network => {
    // Session object: { address: string, sessionType: string (e.g. ledger)}
    const networkObject = JSON.parse(
      localStorage.getItem(`session_${network.id}`)
    )

    // Only store network object if it has an associated address
    if (networkObject) {
      activeNetworks.push({
        address: networkObject.address,
        networkId: network.id
      })
    }
  })

  return activeNetworks
}

export default {
  initializeFirebase,
  askPermissionAndRegister,
  registerDevice,
  getActiveNetworks
}
