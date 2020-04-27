// adds the signature object to the tx
function createSignedTransactionObject(tx, signature) {
  return Object.assign({}, tx, {
    signatures: [signature]
  })
}

// attaches the request meta data to the message
function createStdTx({ gasEstimate, gasPrices, memo }, messages) {
  const fees = gasPrices
    .map(({ amount, denom }) => ({
      amount: String(Math.round(amount * gasEstimate)),
      denom
    }))
    .filter(({ amount }) => amount > 0)
  return {
    msg: Array.isArray(messages) ? messages : [messages],
    fee: {
      amount: fees.length > 0 ? fees : null,
      gas: gasEstimate
    },
    signatures: null,
    memo
  }
}

/*
The SDK expects a certain message format to serialize and then sign.

type StdSignMsg struct {
  ChainID       string      `json:"chain_id"`
  AccountNumber uint64      `json:"account_number"`
  Sequence      uint64      `json:"sequence"`
  Fee           auth.StdFee `json:"fee"`
  Msgs          []sdk.Msg   `json:"msgs"`
  Memo          string      `json:"memo"`
}
*/
function createSignMessage(jsonTx, { sequence, accountNumber, chainId }) {
  // sign bytes need amount to be an array
  const fee = {
    amount: jsonTx.fee.amount || [],
    gas: jsonTx.fee.gas
  }

  return JSON.stringify(
    removeEmptyProperties({
      fee,
      memo: jsonTx.memo,
      msgs: jsonTx.msg, // weird msg vs. msgs
      sequence,
      account_number: accountNumber,
      chain_id: chainId
    })
  )
}

function formatSignature(signature, sequence, accountNumber, publicKey) {
  return {
    signature: signature.toString(`base64`),
    account_number: accountNumber,
    sequence,
    pub_key: {
      type: `tendermint/PubKeySecp256k1`, // TODO: allow other keytypes
      value: publicKey.toString(`base64`)
    }
  }
}

function removeEmptyProperties(jsonTx) {
  if (Array.isArray(jsonTx)) {
    return jsonTx.map(removeEmptyProperties)
  }

  // string or number
  if (typeof jsonTx !== `object`) {
    return jsonTx
  }

  const sorted = {}
  Object.keys(jsonTx)
    .sort()
    .forEach(key => {
      if (jsonTx[key] === undefined || jsonTx[key] === null) return

      sorted[key] = removeEmptyProperties(jsonTx[key])
    })
  return sorted
}

export async function getSignableObject(
  chainMessages,
  { gasEstimate, gasPrices, memo = ``, chainId, accountNumber, sequence }
) {
  // sign transaction
  const stdTx = createStdTx({ gasEstimate, gasPrices, memo }, chainMessages)
  const signMessage = createSignMessage(stdTx, {
    sequence,
    accountNumber,
    chainId
  })

  return signMessage
}

export async function getBroadcastableObject(
  chainMessages,
  { sequence, accountNumber, gasEstimate, gasPrices, memo },
  { signature, publicKey }
) {
  const stdTx = createStdTx({ gasEstimate, gasPrices, memo }, chainMessages)
  const signatureObject = formatSignature(
    Buffer.from(signature, "hex"),
    sequence,
    accountNumber,
    Buffer.from(publicKey, "hex")
  )
  const signedTx = createSignedTransactionObject(stdTx, signatureObject)

  return signedTx
}
