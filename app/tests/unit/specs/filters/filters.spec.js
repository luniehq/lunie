import {
  percentOrPending,
  formatAddress,
  resolveValidatorName,
} from "src/filters"

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

describe(`formatAddress Filter`, () => {
  it(`should return 'Address Not Found' when address is empty`, () => {
    expect(formatAddress(``)).toBe(`Address Not Found`)
  })

  it(`should return an abbreviated version of an Ethereum address, with "0x" and then the first four characters, followed by "..." and finally the last four characters`, () => {
    expect(formatAddress(`0x00b1606fc5b771f3079b4fd3ea49e66a2d5fd665`)).toBe(
      `0x00b1…d665`
    )
  })

  it(`should return an abbreviated version of a Polkadot address, with "0x" and then the first four characters, followed by "..." and finally the last four characters`, () => {
    expect(formatAddress(`00b1606fc5b771f3079b4fd3ea49e66a2d5fd665`)).toBe(
      `00b1…d665`
    )
  })

  it(`should format a truncted address by default`, () => {
    expect(formatAddress(`cosmos1rwmfrdr8dz2va39pdahphzee4d373j6jz6up8j`)).toBe(
      `cosmos…up8j`
    )
  })
})

describe(`resolveValidatorName Filter`, () => {
  let validators

  beforeEach(() => {
    validators = {
      cosmosvaloper1xyz: {
        name: "Big Val",
      },
    }
  })

  it(`should return validator name`, () => {
    expect(resolveValidatorName(`cosmosvaloper1xyz`, validators)).toBe(
      `Big Val`
    )
  })

  it(`should return short address when name not found`, () => {
    expect(
      resolveValidatorName(
        `cosmosvaloper1qecshyc40kshszkwrtscgmsdd8tz3n4hrj9yf2`,
        validators
      )
    ).toBe(`cosmosvaloper…9yf2`)
  })
})
