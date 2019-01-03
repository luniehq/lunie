const bip39 = require(`./bip39.min.js`)
const bip32 = require(`./bip32.js`)
const bech32 = require(`bech32`)
const secp256k1 = require(`./secp256k1.min.js`)
import sha256 from "crypto-js/sha256"
import ripemd160 from "crypto-js/ripemd160"
import CryptoJS from "crypto-js"

const hdPathAtom = `m/44'/118'/0'/0/0` // key controlling ATOM allocation

export function generateWalletFromSeed(mnemonic) {
  try {
    const masterKey = deriveMasterKey(mnemonic)
    const { privateKey, publicKey } = deriveKeypair(masterKey)
    const cosmosAddress = createCosmosAddress(publicKey)
    return {
      privateKey: privateKey.toString(`hex`),
      publicKey: publicKey.toString(`hex`),
      cosmosAddress,
      mnemonic
    }
  } catch (err) {
    console.error(err)
    return {}
  }
}

export function generateWallet(randomByteFunc) {
  console.log(randomByteFunc)
  const randomBytes = Buffer.from(randomByteFunc(32), `base64`)
  if (randomBytes.length !== 32) throw Error(`Entropy has incorrect length`)

  const mnemonic = bip39.entropyToMnemonic(randomBytes.toString(`hex`))
  if (mnemonic.split(` `).length !== 24)
    throw Error(`Mnemonic needs to have a length of 24 words.`)

  return generateWalletFromSeed(mnemonic)
}

/* vectors
pub 52FDFC072182654F163F5F0F9A621D729566C74D10037C4D7BBB0407D1E2C64981
acc cosmos1v3z3242hq7xrms35gu722v4nt8uux8nvug5gye
pub 855AD8681D0D86D1E91E00167939CB6694D2C422ACD208A0072939487F6999EB9D
acc cosmos1hrtz7umxfyzun8v2xcas0v45hj2uhp6sgdpac8
*/

// let address = createCosmosAddress(
//   Buffer.from(
//     "52FDFC072182654F163F5F0F9A621D729566C74D10037C4D7BBB0407D1E2C64981",
//     "hex"
//   )
// );
// if (address !== "cosmos1v3z3242hq7xrms35gu722v4nt8uux8nvug5gye") {
//   throw new Error(
//     "address generation is wrong. Expected cosmos1v3z3242hq7xrms35gu722v4nt8uux8nvug5gye, got " +
//       address
//   );
// }
// address = createCosmosAddress(
//   Buffer.from(
//     "855AD8681D0D86D1E91E00167939CB6694D2C422ACD208A0072939487F6999EB9D",
//     "hex"
//   )
// );
// if (address !== "cosmos1hrtz7umxfyzun8v2xcas0v45hj2uhp6sgdpac8") {
//   throw new Error(
//     "address generation is wrong. Expected cosmos1hrtz7umxfyzun8v2xcas0v45hj2uhp6sgdpac8, got " +
//       address
//   );
// }

export function createCosmosAddress(publicKey) {
  let message = CryptoJS.enc.Hex.parse(publicKey.toString(`hex`))
  const hash = ripemd160(sha256(message)).toString()
  const address = Buffer.from(hash, `hex`)
  const cosmosAddress = bech32ify(address, `cosmos`)

  if (cosmosAddress.length !== 45)
    throw Error(`Cosmos address should have length 45`)

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
  if (privateKey.length !== 32)
    throw Error(`privateKey should have length 32 bytes`)

  const publicKey = secp256k1.publicKeyCreate(privateKey, true)
  if (publicKey.length !== 33)
    throw Error(`publicKey should have length 33 bytes`)

  return {
    privateKey,
    publicKey
  }
}

function bech32ify(address, prefix) {
  if (address.length !== 20)
    throw Error(`address should have a length of 20 bytes`)

  let words = bech32.toWords(address)
  return bech32.encode(prefix, words)
}

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

export function createSignMessage(jsonTx, sequence, account_number, chain_id) {
  return JSON.stringify(
    prepareSignBytes({
      fee: jsonTx.fee,
      memo: jsonTx.memo,
      msgs: jsonTx.msg,
      sequence,
      account_number,
      chain_id
    })
  )
}

export function createSignature(signMessage, privateKey, publicKey) {
  const signHash = Buffer.from(sha256(signMessage).toString(), `hex`)

  const { signature } = secp256k1.sign(signHash, Buffer.from(privateKey, `hex`))
  // test created signature
  if (!secp256k1.verify(signHash, signature, Buffer.from(publicKey, `hex`)))
    throw Error(`Created signature couldn't be verified.`)

  return signature.toString(`base64`)
}

export function sign(jsonTx, wallet, { sequence, account_number, chain_id }) {
  // remove empty values
  // Object.keys(jsonObject).forEach(key => {
  //   if (jsonObject[key] === null || jsonObject[key] === undefined) {
  //     delete jsonObject[key];
  //   }
  // });

  // create StdSignMsg
  /*
  type StdSignMsg struct {
    ChainID       string      `json:"chain_id"`
    AccountNumber uint64      `json:"account_number"`
    Sequence      uint64      `json:"sequence"`
    Fee           auth.StdFee `json:"fee"`
    Msgs          []sdk.Msg   `json:"msgs"`
    Memo          string      `json:"memo"`
  }
  */
  const signMessage = createSignMessage(
    jsonTx,
    sequence,
    account_number,
    chain_id
  )
  console.log(`signMessage`, signMessage)

  let signature = createSignature(
    signMessage,
    wallet.privateKey,
    wallet.publicKey
  )

  return {
    pub_key: {
      type: `tendermint/PubKeySecp256k1`, // TODO allow other keytypes
      value: Buffer.from(wallet.publicKey, `hex`).toString(`base64`)
    },
    signature,
    account_number: account_number,
    sequence
  }
}

export function createSignedTx(tx, signature) {
  return Object.assign({}, tx, {
    signatures: [signature]
  })
}

export function createBroadcastBody(signedTx) {
  return JSON.stringify({
    tx: signedTx,
    return: `block`
  })
}
