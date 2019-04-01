import {
  sign,
  createBroadcastBody,
  createSignMessage,
  createSignedTx,
  createSignature
} from "../../scripts/wallet.js"
import { getKey } from "../../scripts/keystore"
import { signatureImport } from "secp256k1"

export default ({ node }) => {
  const state = {
    lock: null,
    nonce: `0`,
    node,
    externals: {
      sign,
      createBroadcastBody,
      createSignMessage,
      createSignedTx,
      createSignature,
      getKey,
      signatureImport
    },
    txQueryIterations: 30,
    txQueryTimeout: 2000
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
    cleanRequestArguments({ state, rootState }, args) {

      const requestMetaData = {
        sequence: state.nonce,
        from: rootState.wallet.address,
        account_number: rootState.wallet.accountNumber,
        chain_id: rootState.connection.lastHeader.chain_id,
        gas: args.gas,
        gas_prices: args.gas_prices,
        simulate: args.simulate,
        memo: `Sent via Lunie`
      }

      // extract type
      const type = args.type

      // get signing method: localkeystore or ledger
      const submitType = args.submitType || `ledger`

      // TODO: refactor to get path request parameters at once
      // extract path parameters
      const to = args.to
      const pathParameter = args.pathParameter
      const properties = [`submitType`, `type`, `to`, `pathParameter`, `gas`, `gas_prices`, `simulate`]
      properties.forEach(property => delete args[property])

      args.base_req = requestMetaData
      return { requestBody: args, type, submitType, to, pathParameter }
    },
    apiRequest(node, type, to, pathParameter, args) {
      // get the generated tx by querying it from the backend
      if (to && pathParameter) {
        return node[type](to, pathParameter, args)
      } else if (to) {
        return node[type](to, args)
      } else {
        return node[type](args)
      }
    },
    async simulateTx({ state, dispatch, rootState }, args) {
      if (!rootState.connection.connected) {
        throw Error(
          `Currently not connected to a secure node. Please try again when Voyager has secured a connection.`
        )
      }

      await dispatch(`queryWalletBalances`) // the nonce was getting out of sync, this is to force a sync

      args.simulate = true
      const { requestBody, type, to, pathParameter } =
        await actions.cleanRequestArguments({ state, rootState }, args)

      const request = actions.apiRequest(
        state.node,
        type,
        to,
        pathParameter,
        requestBody
      )
      const { gas_estimate } = await request.catch(handleSDKError)
      return Number(gas_estimate)
    },
    async signTx({ dispatch, state, rootState }, submitType, tx, args) {
      let signature
      if (submitType === `ledger`) {
        await dispatch(`pollLedgerDevice`)
        const signMessage = state.externals.createSignMessage(
          tx,
          args.base_req
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
          args.base_req.sequence,
          args.base_req.account_number,
          rootState.ledger.pubKey
        )
      } else {
        // get private key to sign
        const wallet = state.externals.getKey(
          rootState.session.localKeyPairName,
          args.password
        )
        signature = state.externals.sign(tx, wallet, args.base_req)
      }
      return signature
    },
    async sendTx({ state, dispatch, commit, rootState }, args) {
      if (!rootState.connection.connected) {
        throw Error(
          `Currently not connected to a secure node. Please try again when Voyager has secured a connection.`
        )
      }

      // the nonce was getting out of sync, this is to force a sync
      await dispatch(`queryWalletBalances`)

      args.simulate = false
      const { gasAdjustment } = rootState.session // we don't use the gas_adjustment flag bc it only works with gas=auto
      const adjustedGas = String(Math.floor(Number(args.gas) * gasAdjustment)) // by using floor we match the displayed expected fees
      args.gas = adjustedGas // only suports integer or auto
      const { requestBody, type, submitType, to, pathParameter } =
        actions.cleanRequestArguments({ state, rootState }, args)

      // generate transaction without signatures (i.e generate_only)
      const request = actions.apiRequest(
        state.node,
        type,
        to,
        pathParameter,
        requestBody
      )
      const generationRes = await request.catch(handleSDKError)
      const tx = generationRes.value

      // sign transaction
      const signature = await actions.signTx(
        { dispatch, state, rootState },
        submitType, tx, args
      )

      // broadcast transaction with signatures included
      const signedTx = state.externals.createSignedTx(tx, signature)
      const body = state.externals.createBroadcastBody(signedTx, `sync`)
      const res = await state.node.postTx(body).catch(handleSDKError)

      // check response code
      assertOk(res)

      // Sometimes we get back failed transactions, which shows only by them having a `code` property
      if (res.code) {
        throw new Error(`Something went wrong while sending the transaction.`)
      }

      // sync success
      if (res.height !== `0`) {
        commit(`setNonce`, String(parseInt(state.nonce) + 1))
        return
      }

      return dispatch(`queryTxInclusion`, res.txhash)
    },
    // wait for inclusion of a tx in a block
    async queryTxInclusion({ state }, txHash) {
      let iterations = state.txQueryIterations // 30 * 2s = 60s max waiting time
      while (iterations-- > 0) {
        try {
          await state.node.tx(txHash)
          break
        } catch (err) {
          // tx wasn't included in a block yet
          await new Promise(resolve =>
            setTimeout(resolve, state.txQueryTimeout)
          )
        }
      }
      if (iterations <= 0) {
        throw new Error(`The transaction was still not included in a block. We can't say for certain it will be included in the future.`)
      }
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
