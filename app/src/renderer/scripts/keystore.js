let CryptoJS = require(`crypto-js`)
let AES = require(`crypto-js/aes`)

const keySize = 256
const iterations = 100

import {
  generateWallet,
  generateWalletFromSeed,
  standardRandomBytesFunc
} from "./wallet.js"

export function storeKeys(keys) {
  localStorage.setItem(`keys`, JSON.stringify(keys))
}
export function loadKeys() {
  return JSON.parse(localStorage.getItem(`keys`) || `[]`)
}

function addKey(wallet, name, password) {
  let keys = loadKeys()

  if (keys.find(key => key.name === name))
    throw new Error(`Key with that name already exists`)

  let ciphertext = encrypt(JSON.stringify(wallet), password)

  keys.push({
    name,
    address: wallet.cosmosAddress,
    wallet: ciphertext
  })

  localStorage.setItem(`keys`, JSON.stringify(keys))
}

export function testPassword(name, password) {
  let keys = loadKeys()

  const key = keys.find(key => key.name === name)
  try {
    // try to decode and check if is json format to proofs that decoding worked
    let decrypted = decrypt(key.wallet, password)
    JSON.parse(decrypted)
    return true
  } catch (err) {
    return false
  }
}

export function addNewKey(
  name,
  password,
  randomBytesFunc = standardRandomBytesFunc
) {
  const wallet = generateWallet(randomBytesFunc)
  addKey(wallet, name, password)

  return wallet
}
export function importKey(name, password, seed) {
  const wallet = generateWalletFromSeed(seed)
  addKey(wallet, name, password)

  return wallet
}

// TODO needs proof reading
function encrypt(msg, pass) {
  let salt = CryptoJS.lib.WordArray.random(128 / 8)

  let key = CryptoJS.PBKDF2(pass, salt, {
    keySize: keySize / 32,
    iterations: iterations
  })

  let iv = CryptoJS.lib.WordArray.random(128 / 8)

  let encrypted = CryptoJS.AES.encrypt(msg, key, {
    iv: iv,
    padding: CryptoJS.pad.Pkcs7,
    mode: CryptoJS.mode.CBC
  })

  // salt, iv will be hex 32 in length
  // append them to the ciphertext for use  in decryption
  let transitmessage = salt.toString() + iv.toString() + encrypted.toString()
  return transitmessage
}

function decrypt(transitmessage, pass) {
  let salt = CryptoJS.enc.Hex.parse(transitmessage.substr(0, 32))
  let iv = CryptoJS.enc.Hex.parse(transitmessage.substr(32, 32))
  let encrypted = transitmessage.substring(64)

  let key = CryptoJS.PBKDF2(pass, salt, {
    keySize: keySize / 32,
    iterations: iterations
  })

  let decrypted = CryptoJS.AES.decrypt(encrypted, key, {
    iv: iv,
    padding: CryptoJS.pad.Pkcs7,
    mode: CryptoJS.mode.CBC
  }).toString(CryptoJS.enc.Utf8)
  return decrypted
}
