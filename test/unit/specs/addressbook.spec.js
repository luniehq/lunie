const mockFsExtra = require("../helpers/fs-mock").default
let Addressbook

describe("Addressbook", () => {
  beforeEach(() => {
    jest.resetModules()
    jest.mock("fs-extra", () => mockFsExtra())
    Addressbook = require("src/main/addressbook.js")
  })

  it("should store peristent peers", () => {
    let addressbook = new Addressbook("./", ["123.456.123.456"])
    expect(addressbook.peers.map(p => p.host)).toContain("123.456.123.456")
  })

  it("should restore saved peers", () => {
    let fs = require("fs-extra")
    fs.writeFile(
      "./config/addressbook.json",
      JSON.stringify(["123.456.123.456"])
    )
    let addressbook = new Addressbook("./config", [])
    expect(addressbook.peers.map(p => p.host)).toContain("123.456.123.456")
  })
})
