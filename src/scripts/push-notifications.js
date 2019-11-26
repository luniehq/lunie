import { Plugins } from "@capacitor/core"
const { PushNotifications } = Plugins
import config from "src/../config"

export const registerPushNotifications = () => {
  PushNotifications.register()

  PushNotifications.addListener("registration", ({ value: token }) => {
    // alert("Push registration success, token: " + token)
    // console.log(token)

    // register this device with out API so it will receive notifications
    fetch(`${config.graphqlHost}/push`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        // networkId: 'cosmos-hub-mainnet',
        pushId: token,
        topics: ["block_cosmos-hub-mainnet"]
      })
    })
      .then(() => console.log("Successfully registered for push notifications"))
      .catch(error =>
        console.error("Failed to register for push notifications", error)
      )
  })

  PushNotifications.addListener("registrationError", error => {
    alert("Error on registration: " + JSON.stringify(error))
  })

  PushNotifications.addListener("pushNotificationReceived", notification => {
    alert("Push received: " + JSON.stringify(notification))
  })
}
