import store from "src/vuex/store"
import { Store } from "vuex"

describe(`Store`, () => {
  it(`check defaults`, () => {
    expect(store()).toBeInstanceOf(Store)
  })
})
