import store from "src/vuex/store"
import { Store } from "vuex"
jest.mock(`@capacitor-community/intercom`, () => ({}))
jest.mock(`src/firebase.js`, () => ({
  auth: () => {},
}))

describe(`Store`, () => {
  it(`check defaults`, () => {
    expect(store()).toBeInstanceOf(Store)
  })
})
