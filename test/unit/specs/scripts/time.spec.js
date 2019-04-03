import time from "renderer/scripts/time"
import lcdClientMock from "renderer/connectors/lcdClientMock.js"
const delegates = lcdClientMock.candidates
import { stakingTxs } from "../store/json/txs"
const unbondingTransaction = stakingTxs[3]

describe(`time helper`, () => {
  describe(`getUnbondingTime`, () => {
    it(`should return NaN with wrong transactions`, () => {
      const address = delegates[0].operator_address
      expect(
        time.getUnbondingTime(stakingTxs[1], {
          [address]: [{
            creation_height: `170`,
            completion_time: new Date().toISOString()
          }]
        })
      ).toBe(NaN)
    })

    it(`should return NaN for unbonding transactions when height does not match`, () => {
      const address = delegates[0].operator_address
      expect(
        time.getUnbondingTime(unbondingTransaction, {
          [address]: [{
            creation_height: `171`,
            completion_time: new Date().toISOString()
          }]
        })
      ).toBe(NaN)
    })

    it(`should return time for unbonding transactions when height match`, () => {
      const address = delegates[0].operator_address
      expect(
        time.getUnbondingTime(unbondingTransaction, {
          [address]: [{
            creation_height: `569`,
            completion_time: new Date(Date.now()).toISOString()
          }]
        })
      ).toBe(42000)
    })
  })
})
