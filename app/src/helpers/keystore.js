// require the plugin
// import { SecureStorage } from "nativescript-secure-storage"
// instantiate the plugin
// let secureStorage = new SecureStorage()
let CryptoJS = require(`crypto-js`)
let AES = require(`crypto-js/aes`)

import { generateWallet, generateWalletFromSeed } from "./wallet.js"

export async function storeKeyNames(keys) {
  // async
  await localStorage.set({
    key: `keys`,
    value: JSON.stringify(keys)
  })
}
export async function loadKeyNames() {
  return await localStorage.get({
    key: `keys`
  })
}
async function storeKey(wallet, name, password) {
  let ciphertext = AES.encrypt(JSON.stringify(wallet), password).toString()
  await localStorage.set({
    key: `key_` + name,
    value: ciphertext
  })
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
