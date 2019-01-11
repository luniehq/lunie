let CryptoJS = require(`crypto-js`)
let AES = require(`crypto-js/aes`)

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

  let ciphertext = AES.encrypt(JSON.stringify(wallet), password).toString()

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
    JSON.parse(AES.decrypt(key.wallet, password).toString(CryptoJS.enc.Utf8))
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
