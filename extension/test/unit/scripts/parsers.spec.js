import { parseTx } from '../../../src/scripts/parsers'

const signedMessage = {
  msgs: [
    {
      type: 'cosmos-sdk/MsgSend',
      value: {
        amount: [
          {
            amount: '10000000',
            denom: 'stake'
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
        denom: 'stake'
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
      hash: undefined,
      height: undefined,
      details: {
        type: 'SendTx',
        from: ['cosmos1ek9cd8ewgxg9w5xllq9um0uf4aaxaruvcw4v9e'],
        to: ['cosmos1324vt5j3wzx0xsc32mjhkrvy5gn5ef2hrwcg29'],
        amount: { denom: 'STAKE', amount: 10 }
      },
      timestamp: undefined,
      memo: '',
      fees: [{ denom: 'STAKE', amount: 0.00004 }],
      success: false
    }
    expect(parseTx(JSON.stringify(signedMessage))).toEqual(parsedTx)
  })

  it(`should parse a signedmessaged parseFee`, () => {
    expect(parseTx(JSON.stringify(signedMessage)).fees[0].amount).toBe(0.00004)
  })

  it(`should parse a signedmessaged parseFee if there are no fees`, () => {
    const noFeesSignedMessage = signedMessage
    noFeesSignedMessage.fee.amount = { amount: 0, denom: 'stake' }
    expect(parseTx(JSON.stringify(noFeesSignedMessage)).fees[0].amount).toBe(0)
  })
})
