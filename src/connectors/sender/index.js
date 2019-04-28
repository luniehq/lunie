import { getErrorMessage } from "scripts/sdk-errors"
import MessageConstructors from "./messages"
import Api from "../api"
import { createSignMessage, createSignature } from "./signature"

/*
* Sender object to build and send transactions
* Example:
* const sender = Sender("https://stargate.lunie.io", "cosmos1abcd1234", "testnet", ledgerSigner)
* const msg = sender
* .MsgSend({toAddress: 'cosmos1abcd09876', amounts: [{ denom: 'stake', amount: 10 }})
* const gasEstimate = await msg.simulate()
* const { included }= await msg.send({ gas: gasEstimate })
* await included()
*/

const DEFAULT_GAS_PRICE = (2.5e-8).toFixed(9)

export class Sender {
  constructor(cosmosRESTURL, senderAddress, chainId, signer = async signMessage => ({
    signature: new Buffer(),
    publicKey: new Buffer()
  })) {
    this.url = cosmosRESTURL
    this.api = Api(cosmosRESTURL)
    this.senderAddress = senderAddress
    this.chainId = chainId
    this.signer = signer
  }

  async send({ gas, gasPrice = DEFAULT_GAS_PRICE, memo = `` }, msg) {
    const { sequence, account_number } = await this.api.getAccount(this.senderAddress)

    // sign transaction
    const stdTx = createStdTx({ gas, gasPrice, memo }, msg)
    const signMessage = createSignMessage(stdTx, { sequence, account_number, chain_id: this.chainId })
    const { signature, publicKey } = await this.signer(signMessage)
    
    // broadcast transaction with signatures included
    const signatureObject = createSignature(signature, sequence, account_number, publicKey)
    const signedTx = createSignedTransaction(stdTx, signatureObject)
    const body = createBroadcastBody(signedTx, `sync`)
    const res = await fetch(`${this.url}/txs`, { method: `POST`, body })
      .then(res => res.json)
      .catch(handleSDKError)

    // check response code
    assertOk(res)

    // Sometimes we get back failed transactions, which shows only by them having a `code` property
    if (res.code) {
      // TODO get message from SDK: https://github.com/cosmos/cosmos-sdk/issues/4013
      throw new Error(`Error sending: ${getErrorMessage(Number(res.code))}`)
    }

    return {
      hash: res.txhash,
      sequence,
      included: () => this.queryTxInclusion(res.txhash)
    }
  }

  async simulate(
    msg,
    memo
  ) {
    const type = msg.type
    const path = {
      "cosmos-sdk/MsgSend": `/bank/accounts/${this.senderAddress}/transfers`,
      "cosmos-sdk/MsgDelegate": `/staking/delegators/${this.senderAddress}/delegations`,
      "cosmos-sdk/MsgUndelegate": `/staking/delegators/${this.senderAddress}/unbonding_delegations`,
      "cosmos-sdk/MsgBeginRedelegate": `/staking/delegators/${this.senderAddress}/redelegations`,
      "cosmos-sdk/MsgSubmitProposal": `/gov/proposals`,
      "cosmos-sdk/MsgVote": `/gov/proposals/${msg.value.proposal_id}/votes`,
      "cosmos-sdk/MsgDeposit": `/gov/proposals/${msg.value.proposal_id}/deposits`,
      "cosmos-sdk/MsgWithdrawDelegationReward": `/distribution/delegators/${this.senderAddress}/rewards`
    }[type]
    const url = `${this.url}${path}`

    // get the sequence number
    const { sequence, account_number: accountNumber } = await this.api.getAccount(this.senderAddress)
    const tx = this.createRESTPOSTObject({ sequence, accountNumber, memo }, msg)
    // set tx to only simulate
    tx.base_req.simulate = true

    const { gas_estimate } = await fetch(url, { method: `POST`, body: tx }).then(res => res.json())
    return Number(gas_estimate)
  }

  // attaches the request meta data to the message
  createRESTPOSTObject({ sequence, accountNumber, gas, gasPrice, memo }, msg) {
    const requestMetaData = {
      sequence,
      from: this.senderAddress,
      account_number: accountNumber,
      chain_id: this.chainId,
      gas,
      gas_prices: [gasPrice],
      simulate: false,
      memo
    }

    return { base_req: requestMetaData, ...msg }
  }

  // wait for inclusion of a tx in a block
  // Default waiting time: 30 * 2s = 60s
  async queryTxInclusion(txHash, iterations = 30, timeout = 2000) {
    while (iterations-- > 0) {
      try {
        await this.api.tx(txHash)
        break
      } catch (err) {
        // tx wasn't included in a block yet
        await new Promise(resolve =>
          setTimeout(resolve, timeout)
        )
      }
    }
    if (iterations <= 0) {
      throw new Error(`The transaction was still not included in a block. We can't say for certain it will be included in the future.`)
    }
  }
}

// attaches the request meta data to the message
function createStdTx({ gas, gasPrice, memo }, msg) {
  return {
    msg,
    fee: {
      amount: [{ amount: gasPrice.amount * gas, denom: gasPrice.denom }],
      gas
    },
    signatures: null,
    memo
  }
}

// the broadcast body consists of the signed tx and a return type
// returnType can be block (inclusion in block), async (right away), sync (after checkTx has passed)
function createBroadcastBody(signedTx, returnType = `sync`) {
  return JSON.stringify({
    tx: signedTx,
    mode: returnType
  })
}

// adds the signature object to the tx
function createSignedTransaction(tx, signature) {
  return Object.assign({}, tx, {
    signatures: [signature]
  })
}

// beautify the errors returned from the SDK
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

// assert that a transaction was sent successful
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

// add message constructors to the Sender to provide a simple API
Object.values(MessageConstructors)
  .filter(messageConstructor => messageConstructor.name !== `default`)
  .forEach(messageConstructor => {
    Sender.prototype[messageConstructor.name] = function (...args) {
      const message = messageConstructor(this.senderAddress, args)

      return {
        simulate: (memo = ``) => this.simulate(message, memo),
        send: ({ gas, gasPrice, memo }) => this.send({ gas, gasPrice, memo }, message)
      }
    }
  })