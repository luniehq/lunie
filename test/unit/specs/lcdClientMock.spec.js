import bech32 from "bech32"
describe("LCD Client Mock", () => {
  let client

  beforeEach(() => {
    jest.resetModules()
    let lcdClientMock = require("renderer/connectors/lcdClientMock.js")
    client = lcdClientMock
  })

  it("shows a connected state", async () => {
    expect(await client.lcdConnected()).toBe(true)
  })

  it("generates seeds", async () => {
    let seed = await client.generateSeed()
    expect(seed.split(" ").length).toBe(16)
  })

  it("persists keys", async () => {
    let seed = await client.generateSeed()
    let res = await client.storeKey({
      name: "foo",
      password: "1234567890",
      seed
    })
    try {
      bech32.decode(res)
      expect(true).toBe(true)
    } catch (error) {
      console.log(error)
      expect(false).toBe(true)
    }
    res = await client.listKeys()
    expect(res.find(k => k.name === "foo")).toBeDefined()

    res = await client.getKey("foo")
    expect(res.name).toBe("foo")
  })

  it("updates keys", async () => {
    let res = await client.storeKey({
      name: "foo",
      password: "1234567890",
      seed_phrase: "seed some thin"
    })

    res = await client.updateKey("foo", {
      name: "foo",
      old_password: "1234567890",
      new_password: "12345678901"
    })
    await expect(
      client.updateKey("foo", {
        name: "foo",
        old_password: "1234567890",
        new_password: "12345678901"
      })
    ).rejects.toMatchSnapshot()

    res = await client.getKey("foo")
    expect(res.name).toBe("foo")
  })

  it("deletes keys", async () => {
    let res = await client.storeKey({
      name: "foo",
      password: "1234567890",
      seed_phrase: "seed some thin"
    })

    await expect(
      client.deleteKey("foo", { name: "foo", password: "___" })
    ).rejects.toMatchSnapshot()
    await client.deleteKey("foo", { name: "foo", password: "1234567890" })
    res = await client.getKey("foo")
    expect(res).toBeUndefined()
  })

  xit("persists a sent tx", async () => {
    // let res = await client.coinTxs("DF096FDE8D380FA5B2AD20DB2962C82DDEA1ED9B")
    let res = await client.coinTxs("tb1muyklh5d8q86tv4dyrdjjckg9h02rmvm7hntpq")
    expect(res.length).toBe(2) // predefined txs

    let { address: toAddr } = await client.storeKey({
      name: "bar",
      password: "1234567890",
      seed_phrase: "seed some thin"
    })
    res = await client.send(toAddr, {
      sequence: 1,
      name: "default",
      fees: [],
      amount: [
        {
          denom: "mycoin",
          amount: 50
        }
      ]
    })
    expect(res.height).toBeDefined()

    // res = await client.coinTxs("DF096FDE8D380FA5B2AD20DB2962C82DDEA1ED9B")
    res = await client.coinTxs("tb1muyklh5d8q86tv4dyrdjjckg9h02rmvm7hntpq")
    expect(res.length).toBe(3)
  })

  it("query and update the nonce", async () => {
    let { sequence } = await client.queryAccount(
      // "DF096FDE8D380FA5B2AD20DB2962C82DDEA1ED9B"
      "tb1muyklh5d8q86tv4dyrdjjckg9h02rmvm7hntpq"
    )
    expect(sequence).toBe(1)

    let { address: toAddr } = await client.storeKey({
      name: "bar",
      password: "1234567890",
      seed_phrase: "seed some thin"
    })
    let tx = await client.send(toAddr, {
      sequence: 1,
      name: "default",
      fees: [],
      amount: [
        {
          denom: "mycoin",
          amount: 50
        }
      ]
    })
    let account = await client.queryAccount(
      // "DF096FDE8D380FA5B2AD20DB2962C82DDEA1ED9B"
      "tb1muyklh5d8q86tv4dyrdjjckg9h02rmvm7hntpq"
    )
    expect(account.sequence).toBe(2)
  })

  it("queries an account", async () => {
    let data = await client.queryAccount(
      // "DF096FDE8D380FA5B2AD20DB2962C82DDEA1ED9B"
      "tb1muyklh5d8q86tv4dyrdjjckg9h02rmvm7hntpq"
    )
    expect(data.coins.find(c => c.denom === "mycoin").amount).toBe(1000)

    let res = await client.queryAccount("address_doesnt_exist")
    expect(res).toBe(undefined)
  })

  it("sends coins", async () => {
    // let toAddr = "AAAA6FDE8D380FA5B2AD20DB2962C82DDEA1EDAA"
    let toAddr = "tb1424xlh5d8q86tv4dyrdjjckg9h02rmd2c4v7dc"
    let res = await client.send(toAddr, {
      sequence: 1,
      name: "default",
      fees: [],
      amount: [
        {
          denom: "mycoin",
          amount: 50
        }
      ]
    })
    expect(res.check_tx.code).toBe(0)

    let account = await client.queryAccount(
      // "DF096FDE8D380FA5B2AD20DB2962C82DDEA1ED9B"
      "tb1muyklh5d8q86tv4dyrdjjckg9h02rmvm7hntpq"
    )
    expect(account.coins.find(c => c.denom === "mycoin").amount).toBe(950)

    let receiveAccount = await client.queryAccount(toAddr)
    expect(receiveAccount.coins.find(c => c.denom === "mycoin").amount).toBe(50)
  })

  it("sends coins to existing account", async () => {
    // let toAddr = "AAAA6FDE8D380FA5B2AD20DB2962C82DDEA1EDAA"
    let toAddr = "tb1424xlh5d8q86tv4dyrdjjckg9h02rmd2c4v7dc"
    let res = await client.send(toAddr, {
      sequence: 1,
      name: "default",
      fees: [],
      amount: [
        {
          denom: "mycoin",
          amount: 50
        }
      ]
    })
    expect(res.check_tx.code).toBe(0)

    res = await client.send(toAddr, {
      sequence: 2,
      name: "default",
      fees: [],
      amount: [
        {
          denom: "mycoin",
          amount: 50
        }
      ]
    })
    expect(res.check_tx.code).toBe(0)

    let account = await client.queryAccount(
      "tb1muyklh5d8q86tv4dyrdjjckg9h02rmvm7hntpq"
      // "DF096FDE8D380FA5B2AD20DB2962C82DDEA1ED9B"
    )
    expect(account.coins.find(c => c.denom === "mycoin").amount).toBe(900)

    let receiveAccount = await client.queryAccount(toAddr)
    expect(receiveAccount.coins.find(c => c.denom === "mycoin").amount).toBe(
      100
    )
  })

  it("fails to send coins you dont have", async () => {
    let { address: toAddr } = await client.storeKey({
      name: "bar",
      password: "1234567890",
      seed_phrase: "seed some thin"
    })
    let res = await client.send(toAddr, {
      sequence: 1,
      name: "default",
      fees: [],
      amount: [
        {
          denom: "mycoin",
          amount: 100000
        }
      ]
    })
    expect(res.check_tx.code).toBe(1)
  })

  it("fails to send coins from a nonexistent account", async () => {
    // let toAddr = "AAAA6FDE8D380FA5B2AD20DB2962C82DDEA1EDAA"
    let toAddr = "tb1424xlh5d8q86tv4dyrdjjckg9h02rmd2c4v7dc"
    await client.storeKey({
      name: "somekey",
      password: "1234567890",
      seed_phrase: "seed some thin test lol"
    })
    let res = await client.send(toAddr, {
      sequence: 1,
      name: "somekey",
      fees: [],
      amount: [
        {
          denom: "mycoin",
          amount: 100000
        }
      ]
    })
    expect(res.check_tx.code).toBe(1)
  })

  it("fails to send negative amounts", async () => {
    let { address: toAddr } = await client.storeKey({
      name: "bar",
      password: "1234567890",
      seed: "seed some thin"
    })
    let res = await client.send(toAddr, {
      sequence: 1,
      name: "default",
      fees: [],
      amount: [
        {
          denom: "mycoin",
          amount: -50
        }
      ]
    })
    expect(res.check_tx.code).toBe(1)
  })

  xit("queries for a candidate", async () => {
    let { data } = await client.candidate(
      // "88564A32500A120AA72CEFBCF5462E078E5DDB70B6431F59F778A8DC4DA719A4"
      "tb13pty5vjspgfq4feva770233wq789mkmskep37k0h0z5dcnd8rxjqy0c8yd"
    )
    expect(data.address).not.toBeFalsy()
  })

  xit("queries for all candidates", async () => {
    let { data } = await client.candidates()
    expect(data.length).toBeGreaterThan(0)
  })

  xit("builds a delegate tx", async () => {
    let res = await client.buildDelegate({
      sequence: 0,
      from: { addr: "foo" },
      amount: { amount: 10 },
      pubkey: "abc"
    })
    expect(res.type).toBe("sigs/one")
  })

  xit("queries bondings per delegator", async () => {
    let res = await client.bondingsByDelegator([
      // "DF096FDE8D380FA5B2AD20DB2962C82DDEA1ED9B",
      "tb1muyklh5d8q86tv4dyrdjjckg9h02rmvm7hntpq",
      // "7A9D783CE542B23FA23DC7F101460879861205772606B4C3FAEAFBEDFB00E7BD"
      "tb102whs089g2erlg3aclcsz3sg0xrpypthycrtfsl6ata7m7cqu77sf2q5vs"
    ])
    expect(res.data.Shares).toBe(5)
  })

  xit("executes a delegate tx", async () => {
    let { data: stake } = await client.bondingsByDelegator([
      // "DF096FDE8D380FA5B2AD20DB2962C82DDEA1ED9B",
      "tb1muyklh5d8q86tv4dyrdjjckg9h02rmvm7hntpq",
      // "88564A32500A120AA72CEFBCF5462E078E5DDB70B6431F59F778A8DC4DA719A4"
      "tb13pty5vjspgfq4feva770233wq789mkmskep37k0h0z5dcnd8rxjqy0c8yd"
    ])
    expect(stake.Shares).toBe(0)

    let tx = await client.buildDelegate({
      sequence: 0,
      // from: { addr: "DF096FDE8D380FA5B2AD20DB2962C82DDEA1ED9B" },
      from: { addr: "tb1muyklh5d8q86tv4dyrdjjckg9h02rmvm7hntpq" },

      amount: { amount: 10 },
      pub_key: {
        // data: "88564A32500A120AA72CEFBCF5462E078E5DDB70B6431F59F778A8DC4DA719A4"
        data: "tb13pty5vjspgfq4feva770233wq789mkmskep37k0h0z5dcnd8rxjqy0c8yd"
      }
    })
    let signedTx = await client.sign({
      name: "foo",
      password: "1234567890",
      tx
    })
    let res = await client.postTx(signedTx)
    expect(res.check_tx.code).toBe(0)

    let { data: updatedStake } = await client.bondingsByDelegator([
      // "DF096FDE8D380FA5B2AD20DB2962C82DDEA1ED9B",
      "tb1muyklh5d8q86tv4dyrdjjckg9h02rmvm7hntpq",
      // "88564A32500A120AA72CEFBCF5462E078E5DDB70B6431F59F778A8DC4DA719A4"
      "tb13pty5vjspgfq4feva770233wq789mkmskep37k0h0z5dcnd8rxjqy0c8yd"
    ])
    expect(updatedStake.Shares).toBe(10)
  })

  xit("can not stake fermions you dont have", async () => {
    let tx = await client.buildDelegate({
      sequence: 0,
      // from: { addr: ""DF096FDE8D380FA5B2AD20DB2962C82DDEA1ED9B"" },
      from: { addr: "tb1muyklh5d8q86tv4dyrdjjckg9h02rmvm7hntpq" },
      amount: { amount: 100000 },
      pub_key: {
        // data: "88564A32500A120AA72CEFBCF5462E078E5DDB70B6431F59F778A8DC4DA719A4"
        data: "tb13pty5vjspgfq4feva770233wq789mkmskep37k0h0z5dcnd8rxjqy0c8yd"
      }
    })
    let signedTx = await client.sign({
      name: "foo",
      password: "1234567890",
      tx
    })
    let res = await client.postTx(signedTx)
    expect(res.check_tx.code).toBe(1)
  })
})
