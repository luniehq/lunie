jest.mock(`src/firebase.js`, () => ({
  auth: () => {},
}))
const Modules = require(`src/vuex/modules`).default

describe(`Module Index`, () => {
  it(`can be instantiated`, () => {
    const modules = Modules({ node: {} })

    // check modules for correct export interface
    for (const moduleName in modules) {
      const module = modules[moduleName]
      for (const key in module) {
        const vuexModuleKeys = [`state`, `mutations`, `actions`]
        expect(vuexModuleKeys.includes(key)).toBe(true)
      }
    }
  })
})
