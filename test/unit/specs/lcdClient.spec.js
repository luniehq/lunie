let axios = require("axios")
let LcdClient = require("renderer/connectors/lcdClient.js")

describe("LCD Client", () => {
  let client = new LcdClient()

  it("makes a GET request with no args", async () => {
    axios.get = jest
      .fn()
      .mockReturnValueOnce(Promise.resolve({ data: { foo: "bar" } }))

    let res = await client.listKeys()
    expect(res).toEqual({ foo: "bar" })
    expect(axios.get.mock.calls[0]).toEqual([
      "http://localhost:8998/keys",
      undefined
    ])
  })

  it("makes a GET request with one arg", async () => {
    axios.get = jest
      .fn()
      .mockReturnValueOnce(Promise.resolve({ data: { foo: "bar" } }))

    let res = await client.getKey("myKey")
    expect(res).toEqual({ foo: "bar" })
    expect(axios.get.mock.calls[0]).toEqual([
      "http://localhost:8998/keys/myKey",
      undefined
    ])
  })

  it("makes a GET request with multiple args", async () => {
    axios.get = jest
      .fn()
      .mockReturnValueOnce(Promise.resolve({ data: { foo: "bar" } }))

    let res = await client.bondingsByDelegator(["foo", "bar"])
    expect(res).toEqual({ foo: "bar" })
    expect(axios.get.mock.calls[0]).toEqual([
      "http://localhost:8998/query/stake/delegator/foo/bar",
      undefined
    ])
  })

  it("makes a POST request", async () => {
    axios.post = jest
      .fn()
      .mockReturnValueOnce(Promise.resolve({ data: { foo: "bar" } }))

    let res = await client.storeKey()
    expect(res).toEqual({ foo: "bar" })
    expect(axios.post.mock.calls[0]).toEqual([
      "http://localhost:8998/keys",
      undefined
    ])
  })

  it("makes a POST request with args and data", async () => {
    axios.put = jest
      .fn()
      .mockReturnValueOnce(Promise.resolve({ data: { foo: "bar" } }))

    let res = await client.updateKey("myKey", { abc: 123 })
    expect(res).toEqual({ foo: "bar" })
    expect(axios.put.mock.calls[0]).toEqual([
      "http://localhost:8998/keys/myKey",
      { abc: 123 }
    ])
  })

  it("makes a GET request with an error", async () => {
    axios.get = jest.fn().mockReturnValueOnce(
      Promise.reject({
        response: {
          data: {
            error: "foo",
            code: 123
          }
        }
      })
    )

    try {
      await await client.listKeys()
    } catch (err) {
      expect(err.message).toBe("foo")
      expect(err.code).toBe(123)
    }
    expect(axios.get.mock.calls[0]).toEqual([
      "http://localhost:8998/keys",
      undefined
    ])
  })

  it("delete requests have the correct format for data", async () => {
    axios.delete = (path, config) => {
      expect(config).toEqual({ data: { password: "abc" } })
      return Promise.resolve({ data: { foo: "bar" } })
    }

    await client.deleteKey("test", { password: "abc" })
  })

  it("does not throw error for empty results", async () => {
    axios.get = jest.fn().mockReturnValueOnce(
      Promise.reject({
        response: {
          data: {
            error: "account bytes are empty",
            code: 1
          }
        }
      })
    )
    let res = await client.queryAccount("address")
    expect(res).toBe(null)
  })

  it("checks for the connection with the lcd by performing a simple request", async () => {
    client.listKeys = () => Promise.resolve()
    expect(await client.lcdConnected()).toBeTruthy()

    client.listKeys = () => Promise.reject()
    expect(await client.lcdConnected()).toBeFalsy()
  })
})
