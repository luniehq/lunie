import {
  createCosmosAddress,
  createSignMessage,
  generateWalletFromSeed,
  generateSeed,
  generateWallet,
  signWithPrivateKey
} from "scripts/wallet.js"

describe(`Key Generation`, () => {
  it(`should create a master key from a seed`, () => {
    expect(generateWalletFromSeed(`a b c`)).toEqual({
      cosmosAddress: `cosmos1pt9904aqg739q6p9kgc2v0puqvj6atp0zsj70g`,
      privateKey: `a9f1c24315bf0e366660a26c5819b69f242b5d7a293fc5a3dec8341372544be8`,
      publicKey: `037a525043e79a9051d58214a9a2a70b657b3d49124dcd0acc4730df5f35d74b32`
    })
  })

  it(`create a seed`, () => {
    expect(
      generateSeed(() =>
        Array(64)
          .fill(0)
          .join(``)
      )
    ).toBe(
      `abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon art`
    )
  })

  it(`create a keypair`, () => {
    expect(
      generateWallet(() =>
        Array(64)
          .fill(0)
          .join(``)
      )
    ).toEqual({
      cosmosAddress: `cosmos1r5v5srda7xfth3hn2s26txvrcrntldjumt8mhl`,
      privateKey: `8088c2ed2149c34f6d6533b774da4e1692eb5cb426fdbaef6898eeda489630b7`,
      publicKey: `02ba66a84cf7839af172a13e7fc9f5e7008cb8bca1585f8f3bafb3039eda3c1fdd`
    })
  })

  it(`throws an error if entropy function is not producing correct bytes`, () => {
    expect(() =>
      generateSeed(() =>
        Array(10)
          .fill(0)
          .join(``)
      )
    ).toThrow()
  })
})

describe(`Address generation`, () => {
  it(`should create correct cosmos addresses`, () => {
    const vectors = [
      {
        pubkey: `52FDFC072182654F163F5F0F9A621D729566C74D10037C4D7BBB0407D1E2C64981`,
        address: `cosmos1v3z3242hq7xrms35gu722v4nt8uux8nvug5gye`
      },
      {
        pubkey: `855AD8681D0D86D1E91E00167939CB6694D2C422ACD208A0072939487F6999EB9D`,
        address: `cosmos1hrtz7umxfyzun8v2xcas0v45hj2uhp6sgdpac8`
      }
    ]
    vectors.forEach(({ pubkey, address }) => {
      expect(createCosmosAddress(pubkey)).toBe(address)
    })
  })
})

describe(`Signing`, () => {
  const tx = {
    msg: [
      {
        type: `cosmos-sdk/Send`,
        value: {
          inputs: [
            {
              address: `cosmos1qperwt9wrnkg5k9e5gzfgjppzpqhyav5j24d66`,
              coins: [{ denom: `STAKE`, amount: `1` }]
            }
          ],
          outputs: [
            {
              address: `cosmos1yeckxz7tapz34kjwnjxvmxzurerquhtrmxmuxt`,
              coins: [{ denom: `STAKE`, amount: `1` }]
            }
          ]
        }
      }
    ],
    fee: { amount: [{ denom: ``, amount: `0` }], gas: `21906` },
    signatures: null,
    memo: ``
  }
  const txWithNulls = {
    msg: [
      {
        type: `cosmos-sdk/Send`,
        value: {
          inputs: [
            {
              address: `cosmos1qperwt9wrnkg5k9e5gzfgjppzpqhyav5j24d66`,
              coins: [{ denom: `STAKE`, amount: `1` }]
            }
          ],
          outputs: [
            {
              x: undefined,
              address: `cosmos1yeckxz7tapz34kjwnjxvmxzurerquhtrmxmuxt`,
              coins: [{ denom: `STAKE`, amount: `1` }]
            }
          ]
        }
      }
    ],
    fee: { amount: [{ denom: ``, amount: `0` }], gas: `21906` },
    signatures: null,
    memo: ``
  }

  it(`should create a correct signature`, () => {
    const vectors = [
      {
        privateKey: `2afc5a66b30e7521d553ec8e6f7244f906df97477248c30c103d7b3f2c671fef`,
        signMessage: `{"account_number":"1","chain_id":"tendermint_test","fee":{"amount":[{"amount":"0","denom":""}],"gas":"21906"},"memo":"","msgs":[{"type":"cosmos-sdk/Send","value":{"inputs":[{"address":"cosmos1qperwt9wrnkg5k9e5gzfgjppzpqhyav5j24d66","coins":[{"amount":"1","denom":"STAKE"}]}],"outputs":[{"address":"cosmos1yeckxz7tapz34kjwnjxvmxzurerquhtrmxmuxt","coins":[{"amount":"1","denom":"STAKE"}]}]}}],"sequence":"0"}`,
        signature: `YjJhlAf7aCnUtLyBNDp9e6LKuNgV7hJC3rmm0Wro5nBsIPVtWzjuobsp/AhR5Kht+HcRF2zBq4AfoNQMIbY6fw==`
      }
    ]

    vectors.forEach(
      ({
        privateKey,
        signMessage,
        signature: expectedSignature
      }) => {
        const signature = signWithPrivateKey(signMessage, privateKey)
        expect(signature.toString("base64")).toEqual(expectedSignature)
      }
    )
  })
})
