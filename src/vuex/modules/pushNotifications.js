import firebase from "firebase"
import config from "../../../config"
import gql from "graphql-tag"

let messaging

const initializeFirebase = async () => {
  navigator.serviceWorker.register("/firebase-messaging-sw.js", {
    scope: "/"
  })

  firebase.initializeApp({
    apiKey: "AIzaSyCrA4mq9v926h3aX9mfkLlzUSRbjFude14",
    projectId: "lunie-push-notifications",
    messagingSenderId: "783884833065",
    appId: "1:783884833065:web:ea02768959989b9218a738"
  })

  messaging = firebase.messaging()
  messaging.usePublicVapidKey(config.firebasePublicVapidKey)

  await navigator.serviceWorker.ready

  messaging.onMessage(payload => {
    console.log("Message received. ", payload) // TODO: Do something with message when window is open such as a toast
  })
}

const askPermissionAndRegister = async (activeNetworks, apollo) => {
  // Only store for new registrations
  const isDeviceRegistered = localStorage.getItem(
    "registration-push-notifications"
  ) // "true" if stored

  if (isDeviceRegistered !== "true") {
    try {
      messaging
        .requestPermission()
        .then(async () => {
          // First delete old token
          const oldToken = localStorage.getItem(
            "registration-push-notifications-token"
          )

          if (oldToken) {
            try {
              await messaging.deleteToken(oldToken)
            } catch (error) {
              console.log(
                "bug FCM throws error while deleting token on first refresh"
              )
            }
          }

          // Granted? Store device
          const token = await messaging.getToken()
          await registerDevice(token, activeNetworks, apollo)
        })
        .catch(error =>
          console.log(
            "bug FCM throws error while deleting token on first refresh",
            error
          )
        )
    } catch (error) {
      console.log("Permission denied", error)
    }
  }
}

const registerDevice = async (token, activeNetworks, apollo) => {
  await apollo.mutate({
    mutation: gql`
      mutation($token: String!, $activeNetworks: String!, $topics: [String]) {
        registerDevice(
          token: $token
          activeNetworks: $activeNetworks
          topics: $topics
        ) {
          topics
        }
      }
    `,
    variables: {
      token,
      activeNetworks: JSON.stringify(activeNetworks)
    }
  })

  localStorage.setItem("registration-push-notifications", "true")
  localStorage.setItem("registration-push-notifications-token", token)
}

export default {
  initializeFirebase,
  askPermissionAndRegister,
  registerDevice
}
