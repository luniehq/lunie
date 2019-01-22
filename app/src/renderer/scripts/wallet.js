const bip39 = require(`bip39`)
const bip32 = require(`bip32`)
const bech32 = require(`bech32`)
const secp256k1 = require(`secp256k1`)
import sha256 from "crypto-js/sha256"
import ripemd160 from "crypto-js/ripemd160"
import CryptoJS from "crypto-js"
import { type } from "os"

const hdPathAtom = `m/44'/118'/0'/0/0` // key controlling ATOM allocation

const standardRandomBytesFunc = x => CryptoJS.lib.WordArray.random(x).toString()

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

export function createCosmosAddress(publicKey) {
  let message = CryptoJS.enc.Hex.parse(publicKey.toString(`hex`))
  const hash = ripemd160(sha256(message)).toString()
  const address = Buffer.from(hash, `hex`)
  const cosmosAddress = bech32ify(address, `cosmos`)

  return cosmosAddress
}

function deriveMasterKey(mnemonic) {
  // throws if mnemonic is invalid
  bip39.validateMnemonic(mnemonic)

  let seed = bip39.mnemonicToSeed(mnemonic)
  let masterKey = bip32.fromSeed(seed)
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
  let words = bech32.toWords(address)
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

  const keys = Object.keys(jsonTx)
  if (keys.length === 2 && keys.includes(`type`) && keys.includes(`value`)) {
    return prepareSignBytes(jsonTx.value)
  }

  let sorted = {}
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

// produces the signature for a message in base64
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
  // console.log(Buffer.from(publicKey.buffer).toString(`base64`))
  return {
    signature: signature.toString(`base64`),
    account_number,
    sequence,
    pub_key: {
      type: `tendermint/PubKeySecp256k1`, // TODO allow other keytypes
      value: Buffer.from(publicKey, `hex`).toString(`base64`)
    }
  }
}

// main function to sign a jsonTx using a wallet object
// returns the complete signature object to add to the tx
export function sign(jsonTx, wallet, requestMetaData) {
  let { sequence, account_number } = requestMetaData
  const signMessage = createSignMessage(jsonTx, requestMetaData)
  let signature = signWithPrivateKey(signMessage, wallet.privateKey)

  return createSignature(signature, sequence, account_number, wallet.publicKey)
}

// adds the signature object to the tx
export function createSignedTx(tx, signature) {
  return Object.assign({}, tx, {
    signatures: [signature]
  })
}

// the broadcast body consists of the signed tx and a return type
export function createBroadcastBody(signedTx) {
  return JSON.stringify({
    tx: signedTx,
    return: `block`
  })
}
