import {
  storeKeys,
  loadKeys,
  addNewKey,
  testPassword,
  importKey
} from "renderer/scripts/keystore.js"

const wallet = {
  cosmosAddress: `cosmos1r5v5srda7xfth3hn2s26txvrcrntldjumt8mhl`,
  mnemonic: `abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon art`,
  privateKey: `8088c2ed2149c34f6d6533b774da4e1692eb5cb426fdbaef6898eeda489630b7`,
  publicKey: `02ba66a84cf7839af172a13e7fc9f5e7008cb8bca1585f8f3bafb3039eda3c1fdd`
}

describe(`Keystore`, () => {
  beforeEach(() => {
    localStorage.setItem(`keys`, undefined)
  })
  it(`stores a keys array`, () => {
    storeKeys([{ x: 1 }])
    expect(localStorage.getItem(`keys`)).toBe(`[{\"x\":1}]`)
  })

  it(`loads stored keys`, () => {
    storeKeys([{ x: 1 }])
    let keys = loadKeys()
    expect(keys).toEqual([{ x: 1 }])
  })

  it(`imports a key encrypted to localstorage`, () => {
    importKey(`test`, `1234567890`, wallet.mnemonic)
    let keys = loadKeys()
    expect(keys).toEqual([
      {
        address: `cosmos1r5v5srda7xfth3hn2s26txvrcrntldjumt8mhl`,
        name: `test`,
        wallet: expect.stringContaining(``)
      }
    ])
  })

  it(`adds a new key encrypted to localstorage`, () => {
    addNewKey(`test`, `1234567890`)
    let keys = loadKeys()
    expect(keys).toEqual([
      {
        address: expect.stringMatching(/cosmos1.*/),
        name: `test`,
        wallet: expect.stringContaining(``)
      }
    ])
  })

  it(`tests if a password is correct for a locally stored key`, () => {
    addNewKey(`test`, `1234567890`)
    expect(testPassword(`test`, `1234567890`)).toBeTruthy()
    expect(testPassword(`test`, `false`)).toBeFalsy()
  })

  it(`Prevents you from overriding existing key names`, () => {
    addNewKey(`test`, `1234567890`)
    expect(() => addNewKey(`test`, `1234567890`)).toThrow()
  })
})
