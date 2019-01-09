let CryptoJS = require(`crypto-js`)
let AES = require(`crypto-js/aes`)

import { generateWallet, generateWalletFromSeed } from "./wallet.js"

export async function storeKeys(keys) {
  await localStorage.setItem(`keys`, JSON.stringify(keys))
}
export async function loadKeys() {
  return JSON.parse((await localStorage.getItem(`keys`)) || `[]`)
}

async function addKey(wallet, name, password) {
  let keys = await loadKeys()

  if (keys.find(key => key.name === name))
    throw new Error(`Key with that name already exists`)

  let ciphertext = AES.encrypt(JSON.stringify(wallet), password).toString()

  keys.push({
    name,
    address: wallet.cosmosAddress,
    wallet: ciphertext
  })

  await localStorage.setItem(`keys`, JSON.stringify(keys))
}

export async function testPassword(name, password) {
  let keys = await loadKeys()

  const key = keys.find(key => key.name === name)
  try {
    AES.decrypt(key.wallet, password)
    return true
  } catch (err) {
    return false
  }
}

export async function addNewKey(name, password) {
  const wallet = generateWallet(CryptoJS.lib.WordArray.random)
  await addKey(wallet, name, password)

  return wallet
}
export async function importKey(name, password, seed) {
  const wallet = generateWalletFromSeed(seed)
  await addKey(wallet, name, password)

  return wallet
}
