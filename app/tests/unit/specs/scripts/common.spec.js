import { sleep } from "scripts/common"

describe(`sleep`, () => {
  it(`the timer works properly, taking as many millisecons as we input and the Promise returns true`, (done) => {
    let check = false
    const cb = jest.fn(() => (check = true))

    jest.useFakeTimers()
    sleep(10000)
      .then(cb)
      .then(() => expect(cb).toHaveBeenCalled())
      .then(() => expect(check).toBe(true))
      .then(done)

    jest.runAllTimers()
    jest.useRealTimers()
  })
})
