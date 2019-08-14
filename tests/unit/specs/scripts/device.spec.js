import { isMobile } from "scripts/device"

describe(`isMobile`, () => {
  it(`detects mobile`, () => {
    navigator.__defineGetter__("userAgent", () => "iPhone")
    expect(isMobile()).toBe(true)
  })

  it(`detects non-mobile`, () => {
    navigator.__defineGetter__("userAgent", () => "Desktop")
    expect(isMobile()).toBe(false)
  })
})
