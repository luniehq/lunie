import { roundObjectPercentages } from "src/utils"

const tally = {
  yes: 13.626332,
  no: 47.989636,
  abstain: 9.596008,
  no_with_veto: 28.788024
}

const tally2 = {
  yes: 96.11111,
  no: 1.3224,
  abstain: 1.2555,
  no_with_veto: 1.31099
}

const tally3 = {
  yes: 95.12123,
  no: 0,
  abstain: 0,
  no_with_veto: 4.87877
}

const sum = (a, b) => a + b
const getValues = dataMap => Object.values(dataMap)
const sumOfValues = x => getValues(x).reduce(sum, 0)

describe(`roundObjectPercentages`, () => {
  it(`should sum to 100`, () => {
    expect(sumOfValues(roundObjectPercentages(tally))).toBe(100)
  })

  it(`should sum another to 100`, () => {
    expect(sumOfValues(roundObjectPercentages(tally2))).toBe(100)
  })

  it(`should sum again to 100`, () => {
    expect(sumOfValues(roundObjectPercentages(tally3))).toBe(100)
  })
})
