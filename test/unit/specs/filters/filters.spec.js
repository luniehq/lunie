import { percentOrPending, formatBech32, resolveValidatorName } from "filters"

describe(`PercentOrPending Filter`, () => {
  it(`should return '--' when pending is true`, () => {
    expect(percentOrPending(1234, 1234, true)).toBe(`--`)
  })

  it(`should return 0% percentage when not pending`, () => {
    expect(percentOrPending(0, 100, false)).toBe(`0.00%`)
  })

  it(`should return correct percentage when not pending`, () => {
    expect(percentOrPending(5, 25, false)).toBe(`20.00%`)
  })

  it(`should return 100% percentage when not pending`, () => {
    expect(percentOrPending(1234, 1234, false)).toBe(`100.00%`)
  })
})

describe(`formatBech32 Filter`, () => {
  it(`should return 'Address Not Found' when address is empty`, () => {
    expect(formatBech32(``)).toBe(`Address Not Found`)
  })

  it(`should return 'Not A Valid Bech32 Address' when no 1 is present`, () => {
    expect(formatBech32(`cosmosaddress2asdfasdfasdf`)).toBe(
      `Not A Valid Bech32 Address`
    )
  })

  it(`should format a truncted address by default`, () => {
    expect(formatBech32(`cosmosaddress1asdfasdfasdf`)).toBe(
      `cosmosaddress…asdf`
    )
  })

  it(`should format a longform address address by default`, () => {
    expect(formatBech32(`cosmosaddress1asdfasdfasdf`, true)).toBe(
      `cosmosaddress1asdfasdfasdf`
    )
  })
})

describe(`resolveValidatorName Filter`, () => {
  let validators

  beforeEach(() => {
    validators = {
      cosmosvaloper1xyz: {
        description: {
          moniker: "Big Val"
        }
      }
    }
  })

  it(`should return validator name`, () => {
    expect(resolveValidatorName(`cosmosvaloper1xyz`, validators)).toBe(
      `Big Val`
    )
  })

  it(`should return short address when name not found`, () => {
    expect(resolveValidatorName(`cosmosvaloper1abc`, validators)).toBe(
      `cosmosvaloper…1abc`
    )
  })
})
