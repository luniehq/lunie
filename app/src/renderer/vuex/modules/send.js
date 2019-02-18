import {
  sign,
  createBroadcastBody,
  createSignMessage,
  createSignedTx,
  createSignature
} from "../../scripts/wallet.js"
import { getKey } from "../../scripts/keystore"
import config from "../../../config"
import { signatureImport } from "secp256k1"

export default ({ node }) => {
  const state = {
    lock: null,
    nonce: `0`,
    externals: {
      config,
      sign,
      createBroadcastBody,
      createSignMessage,
      createSignedTx,
      createSignature,
      getKey,
      signatureImport
    }
  }

  const mutations = {
    setNonce(state, nonce) {
      // we may query an account state that still has a nonce older then the one we locally have
      // this is because the nonce only updates after txs where incorporated in a block
      if (state.nonce < nonce) state.nonce = nonce
    }
  }

  const actions = {
    // `lock` is a Promise which is set if we are in the process
    // of sending a transaction, so that we can ensure only one send
    // happens at once. otherwise, we might try to send 2 transactions
    // using the same sequence number, which means 1 of them won't be valid.
    async queueTx({ dispatch, state }, args) {
      // wait to acquire lock
      while (state.lock != null) {
        // eslint-disable-line no-unmodified-loop-condition
        await state.lock
      }

      try {
        // send tx and store lock to prevent other txs to be send meanwhile
        state.lock = dispatch(`sendTx`, args)

        // wait for sendTx to finish
        const res = await state.lock
        return res
      } catch (error) {
        throw error
      } finally {
        // get rid of lock whether doSend throws or succeeds
        state.lock = null
      }
    },
    resetSessionData({ state }) {
      state.nonce = `0`
    },
    async sendTx({ state, dispatch, commit, rootState }, args) {
      if (!rootState.connection.connected) {
        throw Error(
          `Currently not connected to a secure node. Please try again when Voyager has secured a connection.`
        )
      }

      await dispatch(`queryWalletBalances`) // the nonce was getting out of sync, this is to force a sync

      const requestMetaData = {
        sequence: state.nonce,
        from: rootState.wallet.address,
        account_number: rootState.wallet.accountNumber,
        chain_id: rootState.connection.lastHeader.chain_id,
        gas: String(state.externals.config.default_gas),
        generate_only: true
      }
      args.base_req = requestMetaData

      // extract type
      const type = args.type || `send`
      delete args.type

      // get signing method: localkeystore or ledger
      const submitType = args.submitType || `local`
      delete args.submitType

      // extract "to" address
      const to = args.to
      delete args.to

      // get the generated tx by querying it from the backend
      const req = to ? node[type](to, args) : node[type](args)
      const generationRes = await req.catch(handleSDKError)
      const tx = generationRes.value

      let signature
      if (rootState.ledger.isConnected && submitType === `ledger`) {
        // TODO: move to wallet script
        const signMessage = state.externals.createSignMessage(
          tx,
          requestMetaData
        )
        const signatureByteArray = await dispatch(`signWithLedger`, signMessage)
        // we have to parse the signature from Ledger as it's in DER format
        const signatureBuffer = state.externals.signatureImport(
          signatureByteArray
        )
        /* 
          NOTE: message is not hashed since Ledger needs to display it on screen
          and then internally hashes the json before signing it
        */
        signature = state.externals.createSignature(
          signatureBuffer,
          requestMetaData.sequence,
          requestMetaData.account_number,
          rootState.ledger.pubKey
        )
      } else {
        // get private key to sign
        const wallet = state.externals.getKey(
          rootState.user.account,
          args.password
        )
        signature = state.externals.sign(tx, wallet, requestMetaData)
      }
      // TODO: signer app
      // broadcast transaction
      const signedTx = state.externals.createSignedTx(tx, signature)
      const body = state.externals.createBroadcastBody(signedTx)
      const res = await node.postTx(body).catch(handleSDKError)
      // check response code
      assertOk(res)
      commit(`setNonce`, String(parseInt(state.nonce) + 1))
    }
  }

  return {
    state,
    mutations,
    actions
  }
}

function assertOk(res) {
  if (Array.isArray(res)) {
    if (res.length === 0) throw new Error(`Error sending transaction`)

    return res.forEach(assertOk)
  }

  if (!res.txhash) {
    const message = res.message
    throw new Error(message)
  }
}

function handleSDKError(err) {
  let message
  // TODO: get rid of this logic once the appended message is actually included inside the object message
  if (!err.message) {
    const idxColon = err.indexOf(`:`)
    const indexOpenBracket = err.indexOf(`{`)
    if (idxColon < indexOpenBracket) {
      // e.g => Msg 0 failed: {"codespace":4,"code":102,"abci_code":262246,"message":"existing unbonding delegation found"}
      message = JSON.parse(err.substr(idxColon + 1)).message
    } else {
      message = err
    }
  } else {
    message = err.message
  }
  throw new Error(message)
}
