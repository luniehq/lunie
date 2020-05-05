import firebase from "firebase/app"
import "firebase/messaging"
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
  const isDeviceRegistered = localStorage.getItem(
    "registration-push-notifications"
  ) // "allowed" / "blocked" if stored, null if not set

  console.log("device", isDeviceRegistered)

  if (isDeviceRegistered === "blocked") {
    return
  }

  if (isDeviceRegistered === "allowed") {
    const token = localStorage.getItem("registration-push-notifications-token")
    registerDevice(token, activeNetworks, apollo, true) // non-blocking
  }

  if (!isDeviceRegistered) {
    // === null
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
              console.error(
                "bug FCM throws error while deleting token on first refresh",
                error
              )
            }
          }

          // Granted? Store device
          const token = await messaging.getToken()
          await registerDevice(token, activeNetworks, apollo)
        })
        .catch(() => {
          localStorage.setItem("registration-push-notifications", "blocked")
        })
    } catch (error) {
      console.error("Push registration failed", error)
    }
  }
}

const registerDevice = async (
  token,
  activeNetworks,
  apollo,
  upsert = false
) => {
  await apollo.mutate({
    mutation: gql`
      mutation(
        $token: String!
        $activeNetworks: String!
        $topics: [String]
        $upsert: Boolean
      ) {
        registerDevice(
          token: $token
          activeNetworks: $activeNetworks
          topics: $topics
          upsert: $upsert
        ) {
          topics
        }
      }
    `,
    variables: {
      token,
      activeNetworks: JSON.stringify(activeNetworks),
      upsert
    }
  })

  localStorage.setItem("registration-push-notifications", "allowed")
  localStorage.setItem("registration-push-notifications-token", token)
}

export default {
  initializeFirebase,
  askPermissionAndRegister,
  registerDevice
}
