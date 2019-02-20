import {
  storeKeys,
  loadKeys,
  addNewKey,
  testPassword,
  importKey,
  getKey
} from "renderer/scripts/keystore.js"

const wallet = {
  cosmosAddress: `cosmos1r5v5srda7xfth3hn2s26txvrcrntldjumt8mhl`,
  mnemonic: `abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon art`,
  privateKey: `8088c2ed2149c34f6d6533b774da4e1692eb5cb426fdbaef6898eeda489630b7`,
  publicKey: `02ba66a84cf7839af172a13e7fc9f5e7008cb8bca1585f8f3bafb3039eda3c1fdd`
}
const accountName = `test`
const password = `1234567890`

describe(`Keystore`, () => {
  beforeEach(() => {
    localStorage.setItem(`keys`, undefined)
  })
  it(`stores a keys array`, () => {
    storeKeys([{ x: 1 }])
    expect(localStorage.getItem(`keys`)).toBe(`[{"x":1}]`)
  })

  it(`loads stored keys`, () => {
    storeKeys([{ x: 1 }])
    const keys = loadKeys()
    expect(keys).toEqual([{ x: 1 }])
  })

  it(`imports a key encrypted to localstorage`, () => {
    importKey(accountName, password, wallet.mnemonic)
    const keys = loadKeys()
    expect(keys).toEqual([
      {
        address: `cosmos1r5v5srda7xfth3hn2s26txvrcrntldjumt8mhl`,
        name: accountName,
        wallet: expect.stringContaining(``)
      }
    ])
  })

  it(`adds a new key encrypted to localstorage`, () => {
    addNewKey(accountName, password)
    const keys = loadKeys()
    expect(keys).toEqual([
      {
        address: expect.stringMatching(/cosmos1.*/),
        name: accountName,
        wallet: expect.stringContaining(``)
      }
    ])
  })

  it(`tests if a password is correct for a locally stored key`, () => {
    addNewKey(accountName, password)
    expect(testPassword(accountName, password)).toBeTruthy()
    expect(testPassword(accountName, `false`)).toBeFalsy()
  })

  it(`Prevents you from overriding existing key names`, () => {
    addNewKey(accountName, password)
    expect(() => addNewKey(accountName, password)).toThrow()
  })

  it(`loads and decrypts a required key`, () => {
    addNewKey(accountName, password)
    const wallet = getKey(accountName, password)
    expect(wallet).toHaveProperty(`privateKey`)
    expect(wallet).toHaveProperty(`publicKey`)
  })

  it(`fails correctly if password is incorrect `, () => {
    addNewKey(accountName, password)
    expect(getKey.bind(null, accountName, `1`)).toThrow()
  })
})
