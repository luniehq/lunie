import { percentOrPending } from "filters"

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
