import { getTxHash, compareBlockTimeDesc } from "scripts/transaction-utils"

describe(`transaction-utils`, () => {
  const string = `4wHwYl3uCloqLIf6CikKFIPMHcOoYjqQbmtzFFdU3g967Y0/EhEKCmxvY2FsVG9rZW4SAzEwMBIpChSDzB3DqGI6kG5rcxRXVN4Peu2NPxIRCgpsb2NhbFRva2VuEgMxMDASCQoDEgEwEMCEPRp2CibrWumHIQLUKUS5mPDRAdBIB5lAw9AIh/aaAL9PTqArOWGO5fpsphJMf8SklUcwRQIhAM9qzjJSTxzXatI3ncHcb1cwIdCTU+oVP4V8RO6lzjcXAiAoS9XZ4e3I/1e/HonfHucRNYE65ioGk88q4dWPs9Z5LA==`
  const hash = `0a31fba9f6d7403b41f5e52c12b98246c7c649af`
  it(`should encode a string correctly`, () => {
    const newHash = getTxHash(string)
    expect(newHash.toLowerCase()).toBe(hash.toLowerCase())
  })

  // export function compareBlockTimeDesc(a, b) {
  //   if (b.blockNumber === a.blockNumber) {
  //     return b.time - a.time
  //   }
  //   return b.blockNumber - a.blockNumber
  // }

  it(`should compare blockHeights correctly`, () => {
    const d = new Date("2018-01-01")
    const d2 = new Date("2017-01-01")

    const a = {
      blockNumber: 1,
      time: d
    }

    const b = {
      blockNumber: 2,
      time: d
    }

    const c = {
      blockNumber: 1,
      time: d2
    }

    expect(compareBlockTimeDesc(a, b) >= 1).toBe(true)
    expect(compareBlockTimeDesc(a, c) < 0).toBe(true)
  })
})
