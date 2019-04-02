const bip39 = require(`bip39`)
const bip32 = require(`bip32`)
const bech32 = require(`bech32`)
const secp256k1 = require(`secp256k1`)
import sha256 from "crypto-js/sha256"
import ripemd160 from "crypto-js/ripemd160"
import CryptoJS from "crypto-js"

const hdPathAtom = `m/44'/118'/0'/0/0` // key controlling ATOM allocation

export function standardRandomBytesFunc (size) {
  /* istanbul ignore if: not testable on node */
  if (window.crypto) {
    let key = ``
    let keyContainer = new Uint32Array(size/4)
    keyContainer = window.crypto.getRandomValues(keyContainer)
    for (let keySegment = 0; keySegment < keyContainer.length; keySegment++) {
      key += keyContainer[keySegment].toString(16) // Convert int to hex
    }
    return key
  } else {
    return CryptoJS.lib.WordArray.random(size).toString()
  }
}

export function generateWalletFromSeed(mnemonic) {
  const masterKey = deriveMasterKey(mnemonic)
  const { privateKey, publicKey } = deriveKeypair(masterKey)
  const cosmosAddress = createCosmosAddress(publicKey)
  return {
    privateKey: privateKey.toString(`hex`),
    publicKey: publicKey.toString(`hex`),
    cosmosAddress
  }
}

export function generateSeed(randomBytesFunc = standardRandomBytesFunc) {
  const randomBytes = Buffer.from(randomBytesFunc(32), `hex`)
  if (randomBytes.length !== 32) throw Error(`Entropy has incorrect length`)
  const mnemonic = bip39.entropyToMnemonic(randomBytes.toString(`hex`))

  return mnemonic
}

export function generateWallet(randomBytesFunc = standardRandomBytesFunc) {
  const mnemonic = generateSeed(randomBytesFunc)
  return generateWalletFromSeed(mnemonic)
}

// NOTE: this only works with a compressed public key (33 bytes)
export function createCosmosAddress(publicKey) {
  const message = CryptoJS.enc.Hex.parse(publicKey.toString(`hex`))
  const hash = ripemd160(sha256(message)).toString()
  const address = Buffer.from(hash, `hex`)
  const cosmosAddress = bech32ify(address, `cosmos`)

  return cosmosAddress
}

function deriveMasterKey(mnemonic) {
  // throws if mnemonic is invalid
  bip39.validateMnemonic(mnemonic)

  const seed = bip39.mnemonicToSeed(mnemonic)
  const masterKey = bip32.fromSeed(seed)
  return masterKey
}

function deriveKeypair(masterKey) {
  const cosmosHD = masterKey.derivePath(hdPathAtom)
  const privateKey = cosmosHD.privateKey
  const publicKey = secp256k1.publicKeyCreate(privateKey, true)

  return {
    privateKey,
    publicKey
  }
}

function bech32ify(address, prefix) {
  const words = bech32.toWords(address)
  return bech32.encode(prefix, words)
}

// Transactions often have amino decoded objects in them {type, value}.
// We need to strip this clutter as we need to sign only the values.
export function prepareSignBytes(jsonTx) {
  if (Array.isArray(jsonTx)) {
    return jsonTx.map(prepareSignBytes)
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

      sorted[key] = prepareSignBytes(jsonTx[key])
    })
  return sorted
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
export function createSignMessage(
  jsonTx,
  { sequence, account_number, chain_id }
) {
  // sign bytes need amount to be an array
  const fee = {
    amount: jsonTx.fee.amount || [],
    gas: jsonTx.fee.gas
  }

  return JSON.stringify(
    prepareSignBytes({
      fee,
      memo: jsonTx.memo,
      msgs: jsonTx.msg, // weird msg vs. msgs
      sequence,
      account_number,
      chain_id
    })
  )
}

// produces the signature for a message (returns Buffer)
export function signWithPrivateKey(signMessage, privateKey) {
  const signHash = Buffer.from(sha256(signMessage).toString(), `hex`)
  const { signature } = secp256k1.sign(signHash, Buffer.from(privateKey, `hex`))
  return signature
}

export function createSignature(
  signature,
  sequence,
  account_number,
  publicKey
) {
  return {
    signature: signature.toString(`base64`),
    account_number,
    sequence,
    pub_key: {
      type: `tendermint/PubKeySecp256k1`, // TODO: allow other keytypes
      value: publicKey.toString(`base64`)
    }
  }
}

// main function to sign a jsonTx using the local keystore wallet
// returns the complete signature object to add to the tx
export function sign(jsonTx, wallet, requestMetaData) {
  const { sequence, account_number } = requestMetaData
  const signMessage = createSignMessage(jsonTx, requestMetaData)
  const signatureBuffer = signWithPrivateKey(signMessage, wallet.privateKey)
  const pubKeyBuffer = Buffer.from(wallet.publicKey, `hex`)
  return createSignature(
    signatureBuffer,
    sequence,
    account_number,
    pubKeyBuffer
  )
}

// adds the signature object to the tx
export function createSignedTx(tx, signature) {
  return Object.assign({}, tx, {
    signatures: [signature]
  })
}

// the broadcast body consists of the signed tx and a return type
// returnType can be block (inclusion in block), async (right away), sync (after checkTx has passed)
export function createBroadcastBody(signedTx, returnType = `block`) {
  return JSON.stringify({
    tx: signedTx,
    return: returnType
  })
}
