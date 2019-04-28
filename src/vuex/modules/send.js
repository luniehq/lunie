import { getKey } from "scripts/keystore"
import { signWithPrivateKey } from "scripts/wallet"
import Sender from "connectors/sender"
import Ledger from "scripts/ledger"

export default ({ node }) => {
  const state = {
    node,
    externals: {
      Sender,
      Ledger,
      getKey,
      signWithPrivateKey
    }
  }

  const mutations = {
  }

  const actions = {
    async getSigner({ state, rootState }, { submitType, password }) {
      if (submitType === `local`) {
        return (signMessage) => {
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

      const sender = new state.Sender(state.node.url, rootState.session.address, rootState.connection.lastHeader.chain_id)

      const gasEstimate = await sender[args.type](args).simulate({ memo: args.memo })

      return gasEstimate
    },
    async sendTx({ state, rootState, dispatch }, {
      type,
      txArguments,
      gas, gasPrice, memo,
      submitType, password
    }) {
      if (!rootState.connection.connected) {
        throw Error(
          `Currently not connected to a secure node. Please try again when Lunie has secured a connection.`
        )
      }

      const signer = await dispatch(`getSigner`, { submitType, password })
      const sender = new state.Sender(state.node.url, rootState.session.address, rootState.connection.lastHeader.chain_id, signer)

      const { included } = await sender[type](txArguments).send({ gas, gasPrice, memo })
      await included()
    },
  }

  return {
    state,
    mutations,
    actions
  }
}
