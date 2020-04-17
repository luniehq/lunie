import firebase from "firebase"
import config from "../../../config"

let messaging

const initializeFirebase = () => {
  firebase.initializeApp({
    apiKey: "AIzaSyCrA4mq9v926h3aX9mfkLlzUSRbjFude14",
    projectId: "lunie-push-notifications",
    messagingSenderId: "783884833065",
    appId: "1:783884833065:web:ea02768959989b9218a738"
  })

  messaging = firebase.messaging()
  messaging.usePublicVapidKey(config.firebasePublicVapidKey)
}

const askPermissionAndRegister = async activeNetworks => {
  // Only store for new registrations
  const isDeviceRegistered = localStorage.getItem(
    "registration-push-notifications"
  ) // "true" if stored

  if (isDeviceRegistered !== "true") {
    const permission = await Notification.requestPermission()

    // Granted? Store device
    if (permission === "granted") {
      const token = await messaging.getToken()
      await registerDevice(token, activeNetworks)
    }
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

export default {
  initializeFirebase,
  askPermissionAndRegister,
  registerDevice
}
