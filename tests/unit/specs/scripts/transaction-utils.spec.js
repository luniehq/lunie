import { compareBlockTimeDesc } from "scripts/transaction-utils"

describe(`transaction-utils`, () => {
  it(`should compare blockHeights correctly`, () => {
    const d = new Date("2018-01-01")
    const d2 = new Date("2017-01-01")

    const a = {
      blockNumber: 1,
      time: d
    }

    const b = {
      blockNumber: 2,
      time: d
    }

    const c = {
      blockNumber: 1,
      time: d2
    }

    expect(compareBlockTimeDesc(a, b) >= 1).toBe(true)
    expect(compareBlockTimeDesc(a, c) < 0).toBe(true)
  })
})
