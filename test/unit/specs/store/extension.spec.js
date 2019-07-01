import extensionModule from "src/vuex/modules/extension.js"

describe(`Module: Extension`, () => {
  let module, state, mutations, node, actions
  const mockWallets = [
    {
      address: "cosmos1234",
      name: "TEST_ADDRESS"
    },
    {
      address: "cosmos1567",
      name: "TEST_ADDRESS_2"
    }
  ]

  beforeEach(() => {
    node = {}
    module = extensionModule({ node })
    state = module.state
    mutations = module.mutations
    actions = module.actions
  })

  it(`should default to signed out state`, () => {
    expect(state.enabled).toBe(false)
  })

  describe(`mutations`, () => {
    it(`should set extension`, () => {
      expect(state.enabled).toBe(false)
      mutations.setExtensionAvailable(state, true)
      expect(state.enabled).toBe(true)
      mutations.setExtensionAvailable(state, false)
      expect(state.enabled).toBe(false)
    })

    it(`should set wallets`, () => {
      expect(state.wallets).toEqual([])
      mutations.setWallets(state, mockWallets)
      expect(state.wallets).toEqual(mockWallets)
    })
  })

  describe("actions", () => {
    it("getAddressesFromExtension", async () => {
      const getWallets = jest.fn()
      await actions.getAddressesFromExtension({
        state: {
          externals: {
            getWallets
          }
        }
      })
      expect(getWallets).toHaveBeenCalled()
    })
  })
})
