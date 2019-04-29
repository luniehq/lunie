import { getKey } from "scripts/keystore"
import { signWithPrivateKey } from "scripts/wallet"
import Cosmos from "@lunie/cosmos-js"
import Ledger from "scripts/ledger"

export default ({ node }) => {
  const state = {
    node,
    externals: {
      Cosmos,
      Ledger,
      getKey,
      signWithPrivateKey
    }
  }

  const mutations = {}

  const actions = {
    async getSigner({ state, rootState }, { submitType, password }) {
      if (submitType === `local`) {
        return signMessage => {
          const wallet = state.externals.getKey(
            rootState.session.localKeyPairName,
            password
          )
          const signature = signWithPrivateKey(signMessage, wallet.privateKey)

          return {
            signature,
            publicKey: wallet.publicKey
          }
        }
      } else {
        return async signMessage => {
          const ledger = new state.externals.Ledger()
          const signature = await ledger.sign(signMessage)
          const publicKey = await ledger.getPubKey()

          return {
            signature,
            publicKey
          }
        }
      }
    },
    async simulateTx({ state, rootState }, args) {
      if (!rootState.connection.connected) {
        throw Error(
          `Currently not connected to a secure node. Please try again when Lunie has secured a connection.`
        )
      }

      const cosmos = new state.externals.Cosmos(
        state.node.url,
        rootState.session.address
      )
      const gasEstimate = cosmos[args.type](args).simulate({ memo: args.memo })

      return gasEstimate
    },
    async sendTx(
      { state, rootState, dispatch },
      { type, txArguments, gas, gasPrice, memo, submitType, password }
    ) {
      if (!rootState.connection.connected) {
        throw Error(
          `Currently not connected to a secure node. Please try again when Lunie has secured a connection.`
        )
      }

      const signer = await dispatch(`getSigner`, { submitType, password })
      const cosmos = new state.externals.Cosmos(
        state.node.url,
        rootState.session.address
      )

      const { included } = await cosmos[type](txArguments).send(
        { gas, gasPrice, memo },
        signer
      )
      await included()
    }
  }

  return {
    state,
    mutations,
    actions
  }
}
