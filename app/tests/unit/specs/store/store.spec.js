import store from "src/vuex/store"
import { Store } from "vuex"

jest.mock(`src/firebase.js`, () => ({
  auth: () => {},
}))

describe(`Store`, () => {
  it(`check defaults`, () => {
    expect(store()).toBeInstanceOf(Store)
  })
})
