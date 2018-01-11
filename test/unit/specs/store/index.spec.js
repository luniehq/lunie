let Modules = require('renderer/vuex/modules').default
let node = require('../../helpers/node_mock')

describe('Module Index', () => {
  it('can be instantiated', () => {
    let modules = Modules({ node })

    // check modules for correct export interface
    for (let moduleName in modules) {
      let module = modules[moduleName]
      for (let key in module) {
        let vuexModuleKeys = [ 'state', 'mutations', 'actions' ]
        expect(vuexModuleKeys.includes(key)).toBe(true)
      }
    }
  })
})
