import { getUnbondTimeFromTX } from "scripts/time"

const wrongTransactionType = {
  type: "cosmos-sdk/MsgSend",
  value: {
    from_address: "cosmos1",
    to_address: "cosmos2",
    amount: [{ denom: "fabocoins", amount: "1234" }]
  },
  key:
    'cosmos-sdk/MsgSend_undefined_{"from_address":"cosmos1","to_address":"cosmos2","amount":[{"denom":"fabocoins","amount":"1234"}]}',
  blockNumber: 150,
  time: new Date("2018-07-01"),
  fees: { amount: "0", denom: "ATOM" },
  group: "banking",
  liquidDate: null
}

const unbondingTransaction = {
  type: "cosmos-sdk/MsgUndelegate",
  value: {
    delegator_address: "cosmos3",
    validator_address: "cosmos4",
    amount: { denom: "uatom", amount: "50000" }
  },
  key:
    'cosmos-sdk/MsgUndelegate_2019-07-31T09:22:23.054Z_{"delegator_address":"cosmos1jq9mc3kp4nnxwryr09fpqjtrwya8q5q480zu0e","validator_address":"cosmosvaloper1vrg6ruw00lhszl4sjgwt5ldvl8z0f7pfp5va85","amount":{"denom":"uatom","amount":"50000"}}',
  blockNumber: 1248479,
  time: "2019-07-31T09:22:23.054Z",
  memo: "",
  fees: { denom: "uatom", amount: "4141" },
  group: "staking"
}

const constantDate = new Date()

describe(`time helper`, () => {
  describe(`getUnbondingTime`, () => {
    it(`should return NaN with wrong transactions`, () => {
      expect(
        getUnbondTimeFromTX(wrongTransactionType, {
          [`cosmosxyz`]: [
            {
              creation_height: `170`,
              completion_time: new Date().toISOString()
            }
          ]
        })
      ).toBe(NaN)
    })

    it(`should return NaN for unbonding transactions when height does not match`, () => {
      expect(
        getUnbondTimeFromTX(unbondingTransaction, {
          [`cosmos4`]: [
            {
              creation_height: `171`,
              completion_time: new Date().toISOString()
            }
          ]
        })
      ).toBe(NaN)
    })

    it(`should return time for unbonding transactions when height match`, () => {
      expect(
        getUnbondTimeFromTX(unbondingTransaction, {
          [`cosmos4`]: [
            {
              creation_height: `1248479`,
              completion_time: constantDate
            }
          ]
        })
      ).toEqual(constantDate)
    })
  })
})
