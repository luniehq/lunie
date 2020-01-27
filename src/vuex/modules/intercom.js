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
      intercom
    },
    actions: {
      displayMessenger({ state }) {
        state.intercom.displayMessenger()
      }
    }
  }
}
