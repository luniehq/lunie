import num from "renderer/scripts/num"

describe("number helper", () => {
  it("should format usd", () => {
    expect(num.usd(1950.12)).toBe("$1,950.12")
  })

  it("should format usd without decimals", () => {
    expect(num.usdInt(1950.12)).toBe("$1,950")
  })

  it("should format numbers showing many decimals", () => {
    expect(num.full(1001950.123456)).toBe("1,001,950.12345600")
  })

  it("should format numbers showing few decimals", () => {
    expect(num.pretty(1001950.123456)).toBe("1,001,950.12")
  })

  it("should format numbers showing no decimals", () => {
    expect(num.prettyInt(1001950.123456)).toBe("1,001,950")
  })

  it("should shorten big numbers", () => {
    expect(num.short(2001001950.123456)).toBe("2.00B")
    expect(num.short(1001950.123456)).toBe("1.00M")
    expect(num.short(3950.123456)).toBe("3.95K")
    expect(num.short(950.123456)).toBe("950.12")
  })

  it("should shorten big numbers showing no decimals", () => {
    expect(num.shortInt(2001001950.123456)).toBe("2.00B")
    expect(num.shortInt(1001950.123456)).toBe("1.00M")
    expect(num.shortInt(3950.123456)).toBe("3.95K")
    expect(num.shortInt(950.123456)).toBe("950")
  })

  it("should format percent without decimals", () => {
    expect(num.percentInt(0.2612)).toBe("26%")
  })

  it("should format percent with decimals", () => {
    expect(num.percent(0.2612)).toBe("26.12%")
  })
})
