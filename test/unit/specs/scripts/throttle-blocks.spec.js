import { throttle } from "scripts/blocks-throttle"

describe("throttle", () => {
  it("should load on first call", async () => {
    const state = {}
    const spy = jest.fn()
    await throttle("test")(10)(state, 5, spy)
    expect(spy).toHaveBeenCalled()
  })

  it("should not call if diff not hit", async () => {
    const state = {
      throttle_test: 100
    }
    const spy = jest.fn()
    await throttle("test")(10)(state, 5, spy)
    expect(spy).not.toHaveBeenCalled()
  })

  it("should call if diff hit", async () => {
    const state = {
      throttle_test: 1
    }
    const spy = jest.fn()
    await throttle("test")(10)(state, 15, spy)
    expect(spy).toHaveBeenCalled()
  })

  it("should not call if called repeatedly", async () => {
    const state = {
      throttle_test: 1
    }
    const spy = jest.fn()
    await throttle("test")(10)(state, 15, spy)
    await throttle("test")(10)(state, 15, spy)
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it("should force callback if desired", async () => {
    const state = {
      throttle_test: 100
    }
    const spy = jest.fn()
    await throttle("test")(10)(state, 5, spy, true)
    expect(spy).toHaveBeenCalled()
  })
})
