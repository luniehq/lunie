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
    expect(res.length).toBe(40)

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
    let res = await client.coinTxs("DF096FDE8D380FA5B2AD20DB2962C82DDEA1ED9B")
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

    res = await client.coinTxs("DF096FDE8D380FA5B2AD20DB2962C82DDEA1ED9B")
    expect(res.length).toBe(3)
  })

  it("query and update the nonce", async () => {
    let { sequence } = await client.queryAccount(
      "DF096FDE8D380FA5B2AD20DB2962C82DDEA1ED9B"
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
      "DF096FDE8D380FA5B2AD20DB2962C82DDEA1ED9B"
    )
    expect(account.sequence).toBe(2)
  })

  it("queries an account", async () => {
    let data = await client.queryAccount(
      "DF096FDE8D380FA5B2AD20DB2962C82DDEA1ED9B"
    )
    expect(data.coins.find(c => c.denom === "mycoin").amount).toBe(1000)

    let res = await client.queryAccount("address_doesnt_exist")
    expect(res).toBe(undefined)
  })

  it("sends coins", async () => {
    let toAddr = "AAAA6FDE8D380FA5B2AD20DB2962C82DDEA1EDAA"
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
      "DF096FDE8D380FA5B2AD20DB2962C82DDEA1ED9B"
    )
    expect(account.coins.find(c => c.denom === "mycoin").amount).toBe(950)

    let receiveAccount = await client.queryAccount(toAddr)
    expect(receiveAccount.coins.find(c => c.denom === "mycoin").amount).toBe(50)
  })

  it("sends coins to existing account", async () => {
    let toAddr = "AAAA6FDE8D380FA5B2AD20DB2962C82DDEA1EDAA"
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
      "DF096FDE8D380FA5B2AD20DB2962C82DDEA1ED9B"
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
    let toAddr = "AAAA6FDE8D380FA5B2AD20DB2962C82DDEA1EDAA"
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

  it("queries for all candidates", async () => {
    let data = await client.candidates()
    expect(data.length).toBeGreaterThan(0)
  })

  it("queries bondings per delegator", async () => {
    let res = await client.queryDelegation(
      "DF096FDE8D380FA5B2AD20DB2962C82DDEA1ED9B",
      "70705055A9FA5901735D0C3F0954501DDE667327"
    )
    expect(res.shares).toBe("5/1")
  })

  it("executes a delegate tx", async () => {
    let stake = await client.queryDelegation(
      "DF096FDE8D380FA5B2AD20DB2962C82DDEA1ED9B",
      "760ACDE75EFC3DD0E4B2A6A3B96D91C05349EA31"
    )
    expect(stake).toBeUndefined()

    let res = await client.updateDelegations({
      sequence: 1,
      name: "default",
      bond: [
        {
          delegator_addr: "DF096FDE8D380FA5B2AD20DB2962C82DDEA1ED9B",
          validator_addr: "760ACDE75EFC3DD0E4B2A6A3B96D91C05349EA31",
          bond: { denom: "mycoin", amount: 10 }
        }
      ],
      unbond: []
    })
    expect(res.length).toBe(1)
    expect(res[0].check_tx.log).toBe("")
    expect(res[0].check_tx.code).toBe(0)

    let updatedStake = await client.queryDelegation(
      "DF096FDE8D380FA5B2AD20DB2962C82DDEA1ED9B",
      "760ACDE75EFC3DD0E4B2A6A3B96D91C05349EA31"
    )
    expect(updatedStake.shares).toBe("10/1")
  })

  it("can not stake fermions you dont have", async () => {
    let res = await client.updateDelegations({
      sequence: 1,
      name: "default",
      bond: [
        {
          delegator_addr: "DF096FDE8D380FA5B2AD20DB2962C82DDEA1ED9B",
          validator_addr: "760ACDE75EFC3DD0E4B2A6A3B96D91C05349EA31",
          bond: { denom: "mycoin", amount: 100000 }
        }
      ],
      unbond: []
    })
    expect(res.length).toBe(1)
    expect(res[0].check_tx.log).toBe("Not enough coins in your account")
    expect(res[0].check_tx.code).toBe(1)
  })
})
