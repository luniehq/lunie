const bip39 = require(`bip39`)
const bip32 = require(`bip32`)
const bech32 = require(`bech32`)
const secp256k1 = require(`secp256k1`)
import sha256 from "crypto-js/sha256"
import ripemd160 from "crypto-js/ripemd160"
import CryptoJS from "crypto-js"

const hdPathAtom = `m/44'/118'/0'/0/0` // key controlling ATOM allocation

export function standardRandomBytesFunc(size) {
  /* istanbul ignore if: not testable on node */
  if (window.crypto) {
    let key = ``
    let keyContainer = new Uint32Array(size / 4)
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

// produces the signature for a message (returns Buffer)
export function signWithPrivateKey(signMessage, privateKey) {
  const signHash = Buffer.from(sha256(signMessage).toString(), `hex`)
  const { signature } = secp256k1.sign(signHash, Buffer.from(privateKey, `hex`))
  return signature
}
