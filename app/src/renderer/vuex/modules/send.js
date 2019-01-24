import {
  sign,
  createBroadcastBody,
  createSignMessage,
  createSignedTx,
  createSignature
} from "../../scripts/wallet.js"
import { getKey } from "../../scripts/keystore"
const config = require(`../../../config.json`)
import { signatureImport } from "secp256k1"

export default ({ node }) => {
  let state = {
    lock: null,
    nonce: `0`
  }

  const mutations = {
    setNonce(state, nonce) {
      // we may query an account state that still has a nonce older then the one we locally have
      // this is because the nonce only updates after txs where incorporated in a block
      if (state.nonce < nonce) state.nonce = nonce
    }
  }

  let actions = {
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
        let res = await state.lock
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

      let requestMetaData = {
        sequence: state.nonce,
        name: `anonymous`, // TODO: replace with address after https://github.com/cosmos/cosmos-sdk/pull/3287 is merged
        from: rootState.wallet.address,
        account_number: rootState.wallet.accountNumber, // TODO: move into LCD?
        chain_id: rootState.connection.lastHeader.chain_id,
        gas: String(config.default_gas),
        generate_only: true
      }
      args.base_req = requestMetaData

      // extract type
      let type = args.type || `send`
      delete args.type

      // extract "to" address
      let to = args.to
      delete args.to

      // get the generated tx by querying it from the backend
      let req = to ? node[type](to, args) : node[type](args)
      let generationRes = await req.catch(handleSDKError)
      const tx = generationRes.value

      let signature
      if (rootState.ledger.isConnected) {
        // TODO: move to wallet script
        const signMessage = createSignMessage(tx, requestMetaData)
        const signatureByteArray = await dispatch(`signWithLedger`, signMessage)
        // we have to parse the signature from Ledger as it's in DER format
        const signatureBuffer = signatureImport(signatureByteArray)
        /* 
          NOTE: message is not hashed since Ledger needs to display it on screen
          and then internally hashes the json before signing it
        */
        signature = createSignature(
          signatureBuffer,
          requestMetaData.sequence,
          requestMetaData.account_number,
          rootState.ledger.pubKey
        )
      } else {
        // get private key to sign
        const wallet = getKey(rootState.user.account, args.password)
        signature = sign(tx, wallet, requestMetaData)
      }
      // broadcast transaction
      const signedTx = createSignedTx(tx, signature)
      const body = createBroadcastBody(signedTx)
      const res = await node.postTx(body).catch(handleSDKError)
      // check response code
      assertOk(res)
      commit(`setNonce`, (parseInt(state.nonce) + 1).toString())
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

  if (res.check_tx.code || res.deliver_tx.code) {
    let message = res.check_tx.log || res.deliver_tx.log
    throw new Error(message)
  }
}

function handleSDKError(err) {
  let message
  // TODO: get rid of this logic once the appended message is actually included inside the object message
  if (!err.message) {
    let idxColon = err.indexOf(`:`)
    let indexOpenBracket = err.indexOf(`{`)
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
