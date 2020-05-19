import config from "src/../config"
import { Intercom } from "capacitor-intercom"

let intercom = null
/* istanbul ignore next */
if (config.mobileApp) {
  intercom = new Intercom()
}

export default () => {
  return {
    state: {
      intercom,
      mobileApp: config.mobileApp,
    },
    actions: {
      displayMessenger({ state }) {
        if (state.mobileApp) {
          // we have to register users otherwise intercom will not open
          state.intercom.registerUnidentifiedUser()
          state.intercom.displayMessenger()
        }
      },
    },
  }
}
