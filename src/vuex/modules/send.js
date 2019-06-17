import { getKey } from "scripts/keystore"
import { signWithPrivateKey } from "@lunie/cosmos-keys"
import Cosmos from "@lunie/cosmos-api"
import Ledger from "@lunie/cosmos-ledger"
import config from "src/config"

export default ({ node }) => {
  const state = {
    node,
    externals: {
      Cosmos,
      Ledger,
      getKey,
      signWithPrivateKey,
      config
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
      const cosmos = new state.externals.Cosmos(
        node.url,
        rootState.connection.lastHeader.chain_id
      )

      const gasEstimate = cosmos[type](
        rootState.session.address,
        txArguments
      ).simulate({ memo: memo })

      return gasEstimate
    },
    async sendTx(
      { state, rootState },
      { type, txArguments, gas, gas_prices, memo, submitType, password }
    ) {
      if (!rootState.connection.connected) {
        throw Error(
          `Currently not connected to a secure node. Please try again when Lunie has secured a connection.`
        )
      }

      const cosmos = new state.externals.Cosmos(
        node.url,
        rootState.connection.lastHeader.chain_id
      )

      const signer = getSigner(state, rootState, { submitType, password })

      const senderAddress = rootState.session.address
      const message = createSendMessage(
        cosmos,
        type,
        senderAddress,
        txArguments
      )

      const { included } = await message.send(
        {
          gas,
          gasPrices: gas_prices,
          memo
        },
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

export function getSigner(state, rootState, { submitType, password }) {
  if (submitType === `local`) {
    return signMessage => {
      const wallet = state.externals.getKey(
        rootState.session.localKeyPairName,
        password
      )
      const signature = state.externals.signWithPrivateKey(
        signMessage,
        Buffer.from(wallet.privateKey, "hex")
      )

      return {
        signature,
        publicKey: Buffer.from(wallet.publicKey, "hex")
      }
    }
  } else {
    return async signMessage => {
      const ledger = new state.externals.Ledger(state.externals.config)
      const publicKey = await ledger.getPubKey()
      const signature = await ledger.sign(signMessage)

      return {
        signature,
        publicKey
      }
    }
  }
}

// create a message object which then can be signed and send
function createSendMessage(cosmos, type, senderAddress, txArguments) {
  // withdrawing is a multi message for all validators you have bond with
  if (type === "MsgWithdrawDelegationReward") {
    const messages = txArguments.validatorAddresses.map(validatorAddress =>
      cosmos[type](senderAddress, { validatorAddress })
    )
    return cosmos.MultiMessage(senderAddress, messages)
  }

  return cosmos[type](senderAddress, txArguments)
}
