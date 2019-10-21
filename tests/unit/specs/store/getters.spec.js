import {
  modalContext,
} from "src/vuex/getters.js"

describe(`Store: getters`, () => {
  xit(`modalContext`, () => {
    let state = {
      connection: {
        externals: {
          node: {
            url: "http://lunie.io"
          }
        },
        lastHeader: {
          chain_id: "cosmoshub"
        },
        connected: true
      },
      extension: {
        enabled: true,
        accounts: []
      },
      session: {
        address: "cosmos1abcdefghijklmop",
        localKeyPairName: "localKeyPairName"
      },
      distribution: {
        rewards: {
          validatorX: {
            uatom: 123
          }
        }
      },
      delegates: {
        delegates: []
      }
    }

    const getters = {
      bondDenom: "uatom",
      totalRewards: 123
    }

    const context = {
      url: "http://lunie.io",
      chainId: "cosmoshub",
      connected: true,
      userAddress: "cosmos1abcdefghijklmop",
      rewards: {
        validatorX: {
          uatom: 123
        }
      },
      delegates: [],
      localKeyPairName: "localKeyPairName",
      bondDenom: "uatom",
      totalRewards: 123,
      isExtensionAccount: false
    }

    const result = modalContext(state, getters)

    expect(result).toEqual(context)
  })
})
