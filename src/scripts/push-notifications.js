import { Plugins } from "@capacitor/core"
import * as Sentry from "@sentry/browser"
const { PushNotifications } = Plugins

export const registerMobilePushNotifications = store => {
  PushNotifications.register()

  PushNotifications.addListener("registration", ({ value: token }) => {
    store.commit("setPushIdToken", token)
  })

  PushNotifications.addListener("registrationError", error => {
    Sentry.captureException(error)
  })

  // TODO if we want to react to notifications while the app is running enter the logic here
  // PushNotifications.addListener("pushNotificationReceived", notification => {
  //   alert("Push received: " + JSON.stringify(notification))
  // })
}
