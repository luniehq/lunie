import { isMobile } from "scripts/device"

describe(`isMobile`, () => {
  it(`detects mobile`, () => {
    navigator.__defineGetter__("userAgent", function() {
      return "iPhone" // customized user agent
    })
    expect(isMobile()).toBe(true)
  })

  it(`detects non-mobile`, () => {
    navigator.__defineGetter__("userAgent", function() {
      return "desktop" // customized user agent
    })
    expect(isMobile()).toBe(false)
  })
})
