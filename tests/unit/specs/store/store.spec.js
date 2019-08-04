import store from "src/vuex/store"
import { Store } from "vuex"

jest.mock(`src/vuex/modules/index.js`, () => () => ({}))

describe(`Store`, () => {
  it(`check defaults`, () => {
    expect(store()).toBeInstanceOf(Store)
  })
})
