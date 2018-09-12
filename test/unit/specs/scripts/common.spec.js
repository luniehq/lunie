import { shortAddress } from "renderer/scripts/common"

describe("shortAddress", () => {
  const bech32ish = "asdf1asdfghjkl"
  const longString = "qwertyuiopasdfghjklzxcvbnm"

  it("should treat bech32ish like bech32", () => {
    const shortString = shortAddress(bech32ish)
    expect(shortString.toLowerCase()).toBe("asdf…hjkl")
  })
  it("should return short bech32ish ", () => {
    const shortBech32ish = "as1d"
    const shortString = shortAddress(shortBech32ish)
    expect(shortString.toLowerCase()).toBe("as1d")
  })

  it("should shorten string by default", () => {
    const shortString = shortAddress(longString)
    expect(shortString.toLowerCase()).toBe("qwer…vbnm")
  })
  it("should shorten string by 5", () => {
    const shortString = shortAddress(longString, 5)
    expect(shortString.toLowerCase()).toBe("qwert…cvbnm")
  })

  it("should return already short string", () => {
    const tinyString = "qwe"
    const shortString = shortAddress(tinyString)
    expect(shortString.toLowerCase()).toBe("qwe")
  })
})
