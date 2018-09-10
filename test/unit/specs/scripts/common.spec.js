import { shortAddress } from "renderer/scripts/common"

describe("shortAddress", () => {
  it("should treat bech32ish like bech32", () => {
    const bech32ish = "asdf1asdfghjkl"
    const shortString = shortAddress(bech32ish)
    expect(shortString.toLowerCase()).toBe("asdf…hjkl")
  })

  it("should shorten string by default", () => {
    const longString = "qwertyuiopasdfghjklzxcvbnm"
    const shortString = shortAddress(longString)
    expect(shortString.toLowerCase()).toBe("qwer…vbnm")
  })
  it("should shorten string by 5", () => {
    const longString = "qwertyuiopasdfghjklzxcvbnm"
    const shortString = shortAddress(longString, 5)
    expect(shortString.toLowerCase()).toBe("qwert…cvbnm")
  })

  it("should return already short string", () => {
    const longString = "qwe"
    const shortString = shortAddress(longString)
    expect(shortString.toLowerCase()).toBe("qwe")
  })
})
