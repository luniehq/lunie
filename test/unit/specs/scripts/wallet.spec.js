import {
  createCosmosAddress,
  sign,
  createSignature,
  createSignMessage,
  generateWalletFromSeed,
  generateSeed,
  generateWallet,
  createSignedTx,
  createBroadcastBody
} from "renderer/scripts/wallet.js"

describe(`Key Generation`, () => {
  it(`should create a master key from a seed`, () => {
    expect(generateWalletFromSeed(`a b c`)).toEqual({
      cosmosAddress: `cosmos1pt9904aqg739q6p9kgc2v0puqvj6atp0zsj70g`,
      mnemonic: `a b c`,
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
      mnemonic: `abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon art`,
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
  let tx = {
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
  let txWithNulls = {
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
    let vectors = [
      {
        privateKey: `2afc5a66b30e7521d553ec8e6f7244f906df97477248c30c103d7b3f2c671fef`,
        publicKey: `03ab1ebbb21aee35154e36aaebc25067177f783f7e967c9d6493e8920c05e40eb5`,
        msg: `{"account_number":"1","chain_id":"tendermint_test","fee":{"amount":[{"amount":"0","denom":""}],"gas":"21906"},"memo":"","msgs":[{"inputs":[{"address":"cosmos1qperwt9wrnkg5k9e5gzfgjppzpqhyav5j24d66","coins":[{"amount":"1","denom":"STAKE"}]}],"outputs":[{"address":"cosmos1yeckxz7tapz34kjwnjxvmxzurerquhtrmxmuxt","coins":[{"amount":"1","denom":"STAKE"}]}]}],"sequence":"0"}`,
        signature: `dRrVzV9ixitWXtXZIgidctjrIPNXMU47eNLolQ1lcRxpFf1crE+b/QrVRwpmiNUdFgPlvWkAJUTygIrFqIVr1w==`
      },
      {
        privateKey: `6e340b9cffb37a989ca544e6bb780a2c78901d3fb33738768511a30617afa01d`,
        publicKey: `0243311589af63c2adda04fcd7792c038a05c12a4fe40351b3eb1612ff6b2e5a0e`,
        msg: `{"account_number":"2","chain_id":"local-testnet","fee":{"amount":[{"amount":"0","denom":""}],"gas":"1"},"memo":"","msgs":[{"inputs":[{"address":"cosmos1qzuezsz32szftzx9j4zrena4sz2nxct2j68565","coins":[{"amount":"10","denom":"localcoin"}]}],"outputs":[{"address":"cosmos194av4adp38js86r8ema8ud3vylzv9s8kt4f0m5","coins":[{"amount":"10","denom":"localcoin"}]}]}],"sequence":"0"}`,
        signature: `uSw0TI4YGPF1RMcx9hISpniM8vRJc6gm/j1ZC0fOA5stJVPBmFqVTxfu/eHEzCJgcFPDJDh1uNHC+DiPaoK9PQ==`
      }
    ]

    vectors.forEach(({ msg, privateKey, publicKey, signature }) =>
      expect(createSignature(msg, privateKey, publicKey)).toBe(signature)
    )
  })

  it(`should create the correct string to sign`, () => {
    let vectors = [
      {
        tx,
        sequence: `0`,
        account_number: `1`,
        chain_id: `tendermint_test`,
        signMessage: `{"account_number":"1","chain_id":"tendermint_test","fee":{"amount":[{"amount":"0","denom":""}],"gas":"21906"},"memo":"","msgs":[{"inputs":[{"address":"cosmos1qperwt9wrnkg5k9e5gzfgjppzpqhyav5j24d66","coins":[{"amount":"1","denom":"STAKE"}]}],"outputs":[{"address":"cosmos1yeckxz7tapz34kjwnjxvmxzurerquhtrmxmuxt","coins":[{"amount":"1","denom":"STAKE"}]}]}],"sequence":"0"}`
      },
      {
        tx: txWithNulls,
        sequence: `0`,
        account_number: `1`,
        chain_id: `tendermint_test`,
        signMessage: `{"account_number":"1","chain_id":"tendermint_test","fee":{"amount":[{"amount":"0","denom":""}],"gas":"21906"},"memo":"","msgs":[{"inputs":[{"address":"cosmos1qperwt9wrnkg5k9e5gzfgjppzpqhyav5j24d66","coins":[{"amount":"1","denom":"STAKE"}]}],"outputs":[{"address":"cosmos1yeckxz7tapz34kjwnjxvmxzurerquhtrmxmuxt","coins":[{"amount":"1","denom":"STAKE"}]}]}],"sequence":"0"}`
      }
    ]

    vectors.forEach(
      ({ tx, sequence, account_number, chain_id, signMessage }) => {
        expect(createSignMessage(tx, sequence, account_number, chain_id)).toBe(
          signMessage
        )
      }
    )
  })

  it(`should create a correct tx signature object`, () => {
    let vectors = [
      {
        wallet: {
          privateKey: `2afc5a66b30e7521d553ec8e6f7244f906df97477248c30c103d7b3f2c671fef`,
          publicKey: `03ab1ebbb21aee35154e36aaebc25067177f783f7e967c9d6493e8920c05e40eb5`
        },
        tx,
        signature: `dRrVzV9ixitWXtXZIgidctjrIPNXMU47eNLolQ1lcRxpFf1crE+b/QrVRwpmiNUdFgPlvWkAJUTygIrFqIVr1w==`,
        sequence: `0`,
        account_number: `1`,
        chain_id: `tendermint_test`,
        pub_key: {
          type: `tendermint/PubKeySecp256k1`,
          value: `A6seu7Ia7jUVTjaq68JQZxd/eD9+lnydZJPokgwF5A61`
        }
      }
    ]

    vectors.forEach(
      ({
        wallet,
        tx,
        pub_key: expectedPubKey,
        signature: expectedSignature,
        sequence,
        account_number,
        chain_id
      }) => {
        let sigObject = sign(tx, wallet, {
          sequence,
          account_number,
          chain_id
        })
        expect(sigObject).toEqual({
          signature: expectedSignature,
          pub_key: expectedPubKey,
          sequence,
          account_number
        })
      }
    )
  })

  it(`attaches a signature`, () => {
    const tx = {}
    const sig = { x: 1 }
    expect(createSignedTx(tx, sig)).toEqual({
      signatures: [{ x: 1 }]
    })
  })

  it(`creates a broadcast body`, () => {
    const signedTx = { x: 1 }
    expect(createBroadcastBody(signedTx)).toEqual(
      JSON.stringify({
        tx: { x: 1 },
        return: `block`
      })
    )
  })
})
