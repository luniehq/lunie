import store from "src/vuex/store"
import { Store } from "vuex"
jest.mock(`capacitor-intercom`, () => ({}))

describe(`Store`, () => {
  it(`check defaults`, () => {
    expect(store()).toBeInstanceOf(Store)
  })
})
