import config from "src/../config"
import { Intercom } from "capacitor-intercom"

let intercom = null
if (config.mobileApp) {
  intercom = new Intercom()
  const userId = "lunie-app-" + Math.floor(Math.random() * 10000 + 1).toString()
  intercom.registerIdentifiedUser({ userId })
}

export default () => {
  return {
    state: {
      intercom
    },
    mutations: {
      displayMessenger(state) {
        state.intercom.displayMessenger()
      },
      displayHelpCenter(state) {
        state.intercom.displayHelpCenter()
      }
    },
    actions: {
      displayMessenger({ commit }) {
        commit(`displayMessenger`)
      },
      displayHelpCenter({ commit }) {
        commit(`displayHelpCenter`)
      }
    }
  }
}
