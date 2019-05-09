import { getKey } from "scripts/keystore"
import { signWithPrivateKey } from "scripts/wallet"
import Cosmos from "@lunie/cosmos-js"
import Ledger from "scripts/ledger"

export default ({ node }) => {
  const state = {
    node,
    cosmos: new Cosmos(node.url),
    externals: {
      Cosmos,
      Ledger,
      getKey,
      signWithPrivateKey
    }
  }

  const mutations = {}

  const actions = {
    async simulateTx({ state, rootState }, { type, txArguments, memo }) {
      if (!rootState.connection.connected) {
        throw Error(
          `Currently not connected to a secure node. Please try again when Lunie has secured a connection.`
        )
      }

      const gasEstimate = state.cosmos[type](
        rootState.session.address,
        txArguments
      ).simulate({ memo: memo })

      return gasEstimate
    },
    async sendTx(
      { state, rootState },
      { type, txArguments, gas, gasPrice, memo, submitType, password }
    ) {
      if (!rootState.connection.connected) {
        throw Error(
          `Currently not connected to a secure node. Please try again when Lunie has secured a connection.`
        )
      }

      const signer = getSigner(state, rootState, { submitType, password })

      const { included } = await state.cosmos[type](
        rootState.session.address,
        txArguments
      ).send({ gas, gasPrice, memo }, signer)
      await included()
    }
  }

  return {
    state,
    mutations,
    actions
  }
}

function getSigner(state, rootState, { submitType, password }) {
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
      await ledger.connect()
      const signature = await ledger.sign(signMessage)
      const publicKey = await ledger.getPubKey()

      return {
        signature,
        publicKey
      }
    }
  }
}
