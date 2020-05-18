import extensionModule from "src/vuex/modules/extension.js"

describe(`Module: Extension`, () => {
  let module, state, mutations, node, actions
  const mockAccounts = [
    {
      address: "cosmos1234",
      name: "TEST_ADDRESS",
    },
    {
      address: "cosmos1567",
      name: "TEST_ADDRESS_2",
    },
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
    it(`should set extension available`, () => {
      expect(state.enabled).toBe(false)
      mutations.setExtensionAvailable(state)
      expect(state.enabled).toBe(true)
    })

    it(`should set wallets`, () => {
      expect(state.accounts).toEqual([])
      mutations.setExtensionAccounts(state, mockAccounts)
      expect(state.accounts).toEqual(mockAccounts)
    })
  })

  describe("actions", () => {
    it("getAddressesFromExtension", async () => {
      const getAccountsFromExtension = jest.fn(() => mockAccounts)
      await actions.getAddressesFromExtension({
        state: {
          externals: {
            getAccountsFromExtension,
          },
        },
      })

      expect(getAccountsFromExtension).toHaveBeenCalled()
    })
  })
})
