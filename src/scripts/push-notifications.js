import { Plugins } from "@capacitor/core"
const { PushNotifications } = Plugins

export const registerMobilePushNotifications = store => {
  PushNotifications.register()

  PushNotifications.addListener("registration", ({ value: token }) => {
    store.commit("setPushIdToken", token)
  })

  PushNotifications.addListener("registrationError", error => {
    alert("Error on registration: " + JSON.stringify(error))
  })

  PushNotifications.addListener("pushNotificationReceived", notification => {
    alert("Push received: " + JSON.stringify(notification))
  })
}
