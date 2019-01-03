// require the plugin
// import { SecureStorage } from "nativescript-secure-storage"
// instantiate the plugin
// let secureStorage = new SecureStorage()
let CryptoJS = require(`crypto-js`)
let AES = require(`crypto-js/aes`)

import { generateWallet, generateWalletFromSeed } from "./wallet.js"

export async function storeKeyNames(keys) {
  // async
  await localStorage.setItem(`keys`, JSON.stringify(keys))
}
export async function loadKeyNames() {
  return JSON.parse((await localStorage.getItem(`keys`)) || `[]`)
}

async function storeKey(wallet, name, password) {
  let ciphertext = AES.encrypt(JSON.stringify(wallet), password).toString()
  await localStorage.setItem(`key_` + name, ciphertext)
}

export async function testPassword(name, password) {
  const key = localStorage.getItem(`key_` + name)
  try {
    const bytes = AES.decrypt(key, password)
    return true
  } catch (err) {
    return false
  }
  // const originalText = bytes.toString(CryptoJS.enc.Utf8);
  // return JSON.parse(originalText);
}
export async function addKey(name, password, wallet) {
  let keysString = (await loadKeyNames()) || `[]`
  let keys = JSON.parse(keysString)

  keys.push({
    name,
    address: wallet.cosmosAddress
  })
  await storeKeyNames(keys)

  await storeKey(wallet, name, password)

  return wallet
}
export async function addNewKey(name, password) {
  const wallet = generateWallet(CryptoJS.lib.WordArray.random)
  await addKey(name, password, wallet)

  return wallet
}
export async function importKey(name, password, seed) {
  const wallet = generateWalletFromSeed(seed)
  await addKey(name, password, wallet)

  return wallet
}
