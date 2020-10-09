import { getDisplayTransaction } from '../../../src/scripts/parsers'

const network = {
  id: `cosmos-hub-mainnet`,
  network_type: `cosmos`,
  coinLookup: [{
    chainDenom: `uatom`,
    viewDenom: `ATOM`,
    chainToViewConversionFactor: 0.000001
  }]
}

const transactionData =   {
  fee: [{
    amount: '40',
    denom: 'uatom'
  }]
}

const transactionDataNoFee =   {
  fee: [{
    amount: '0',
    denom: 'uatom'
  }]
}

const signedMessage = {
  msgs: [
    {
      type: 'cosmos-sdk/MsgSend',
      value: {
        amount: [
          {
            amount: '10000000',
            denom: 'uatom'
          }
        ],
        from_address: 'cosmos1ek9cd8ewgxg9w5xllq9um0uf4aaxaruvcw4v9e',
        to_address: 'cosmos1324vt5j3wzx0xsc32mjhkrvy5gn5ef2hrwcg29'
      }
    }
  ],
  fee: {
    amount: [
      {
        amount: '40',
        denom: 'uatom'
      }
    ],
    gas: '39953'
  },
  memo: ''
}

describe(`parsers helper`, () => {
  it(`should parse a signedmessaged ParseTx`, () => {
    const parsedTx = {
      type: 'SendTx',
      details: JSON.stringify(signedMessage),
      fees: [{ denom: 'ATOM', amount: "0.00004" }],
    }
    expect(getDisplayTransaction(network, parsedTx.type, JSON.stringify(signedMessage), transactionData)).toEqual(parsedTx)
  })

  it(`should parse a signedmessaged parseFee`, () => {
    expect(getDisplayTransaction(network, 'SendTx', JSON.stringify(signedMessage), transactionData).fees[0].amount).toBe('0.00004')
  })

  it(`should parse a signedmessaged parseFee if there are no fees`, () => {
    const noFeesSignedMessage = signedMessage
    noFeesSignedMessage.fee.amount = { amount: 0, denom: 'uatom' }
    expect(getDisplayTransaction(network, 'SendTx', JSON.stringify(noFeesSignedMessage), transactionDataNoFee).fees[0].amount).toBe('0')
  })
})
