import b32 from "scripts/b32"

describe("LCD Client Mock", () => {
  let client, lcdClientMock

  beforeEach(() => {
    jest.resetModules()
    lcdClientMock = require("renderer/connectors/lcdClientMock.js")
    client = lcdClientMock
  })

  it("shows a connected state", async () => {
    expect(await client.lcdConnected()).toBe(true)
  })

  it("generates seeds", async () => {
    let seed = await client.generateSeed()
    expect(seed.split(" ").length).toBe(24)
  })

  it("persists keys", async () => {
    let seed = await client.generateSeed()
    let res = await client.storeKey({
      name: "foo",
      password: "1234567890",
      seed
    })

    b32.decode(res.address)

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
    let res = await client.coinTxs(lcdClientMock.addresses[0])
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

    res = await client.coinTxs(lcdClientMock.addresses[0])
    expect(res.length).toBe(3)
  })

  it("query and update the nonce", async () => {
    let { sequence } = await client.queryAccount(lcdClientMock.addresses[0])
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
    let account = await client.queryAccount(lcdClientMock.addresses[0])
    expect(account.sequence).toBe(2)
  })

  it("queries an account", async () => {
    let data = await client.queryAccount(lcdClientMock.addresses[0])
    expect(data.coins.find(c => c.denom === "mycoin").amount).toBe(1000)

    let res = await client.queryAccount("address_doesnt_exist")
    expect(res).toBe(undefined)
  })

  it("sends coins", async () => {
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

    let account = await client.queryAccount(lcdClientMock.addresses[0])
    expect(account.coins.find(c => c.denom === "mycoin").amount).toBe(950)

    let receiveAccount = await client.queryAccount(toAddr)
    expect(receiveAccount.coins.find(c => c.denom === "mycoin").amount).toBe(50)
  })

  it("sends coins to existing account", async () => {
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

    let account = await client.queryAccount(lcdClientMock.addresses[0])
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

  it("queries for all candidates", async () => {
    let data = await client.candidates()
    expect(data.length).toBeGreaterThan(0)
  })

  it("queries bondings per delegator", async () => {
    let res = await client.queryDelegation(
      lcdClientMock.addresses[0],
      lcdClientMock.validators[0]
    )
    expect(res.shares).toMatchSnapshot()
  })

  it("executes a delegate tx", async () => {
    let stake = await client.queryDelegation(
      lcdClientMock.addresses[0],
      lcdClientMock.validators[2]
    )
    expect(stake).toBeUndefined()

    let res = await client.updateDelegations({
      sequence: 1,
      name: "default",
      delegate: [
        {
          delegator_addr: lcdClientMock.addresses[0],
          validator_addr: lcdClientMock.validators[2],
          bond: { denom: "mycoin", amount: 10 }
        }
      ],
      unbond: []
    })
    expect(res.length).toBe(1)
    expect(res[0].check_tx.log).toBe("")
    expect(res[0].check_tx.code).toBe(0)

    let updatedStake = await client.queryDelegation(
      lcdClientMock.addresses[0],
      lcdClientMock.validators[2]
    )
    expect(updatedStake.shares).toBe("10/1")
  })

  it("executes an unbond tx", async () => {
    let res = await client.updateDelegations({
      sequence: 1,
      name: "default",
      delegate: [
        {
          delegator_addr: lcdClientMock.addresses[0],
          validator_addr: lcdClientMock.validators[2],
          bond: { denom: "mycoin", amount: 10 }
        }
      ],
      unbond: []
    })
    expect(res.length).toBe(1)
    expect(res[0].check_tx.log).toBe("")
    expect(res[0].check_tx.code).toBe(0)

    let initialStake = await client.queryDelegation(
      lcdClientMock.addresses[0],
      lcdClientMock.validators[2]
    )
    expect(initialStake.shares).toBe("10/1")

    res = await client.updateDelegations({
      sequence: 2,
      name: "default",
      delegate: [],
      unbond: [
        {
          delegator_addr: lcdClientMock.addresses[0],
          validator_addr: lcdClientMock.validators[2],
          shares: "5/1"
        }
      ]
    })
    expect(res.length).toBe(1)
    expect(res[0].check_tx.log).toBe("")
    expect(res[0].check_tx.code).toBe(0)

    let updatedStake = await client.queryDelegation(
      lcdClientMock.addresses[0],
      lcdClientMock.validators[2]
    )
    expect(updatedStake.shares).toBe("5/1")
  })

  it("can not stake fermions you dont have", async () => {
    let res = await client.updateDelegations({
      sequence: 1,
      name: "default",
      delegate: [
        {
          delegator_addr: lcdClientMock.addresses[0],
          validator_addr: lcdClientMock.validators[2],
          bond: { denom: "mycoin", amount: 100000 }
        }
      ],
      unbond: []
    })
    expect(res.length).toBe(1)
    expect(res[0].check_tx.log).toBe("Not enough coins in your account")
    expect(res[0].check_tx.code).toBe(1)
  })

  it("errors when delegating with incorrect nonce", async () => {
    let res = await client.updateDelegations({
      sequence: 1,
      name: "default",
      delegate: [
        {
          delegator_addr: lcdClientMock.addresses[0],
          validator_addr: lcdClientMock.validators[2],
          bond: { denom: "mycoin", amount: 10 }
        }
      ],
      unbond: []
    })
    expect(res.length).toBe(1)
    expect(res[0].check_tx.log).toBe("")
    expect(res[0].check_tx.code).toBe(0)

    res = await client.updateDelegations({
      sequence: 1,
      name: "default",
      delegate: [
        {
          delegator_addr: lcdClientMock.addresses[0],
          validator_addr: lcdClientMock.validators[2],
          bond: { denom: "mycoin", amount: 10 }
        }
      ],
      unbond: []
    })
    expect(res.length).toBe(1)
    expect(res[0].check_tx.log).toBe('Expected sequence "2", got "1"')
    expect(res[0].check_tx.code).toBe(2)
  })

  it("errors when delegating with nonexistent account", async () => {
    let res = await client.updateDelegations({
      sequence: 1,
      name: "nonexistent_account",
      delegate: [
        {
          delegator_addr: lcdClientMock.addresses[0],
          validator_addr: lcdClientMock.validators[2],
          bond: { denom: "mycoin", amount: 10 }
        }
      ],
      unbond: []
    })
    expect(res.length).toBe(1)
    expect(res[0].check_tx.log).toBe("Nonexistent account")
    expect(res[0].check_tx.code).toBe(1)
  })

  it("delegates to multiple validators at once", async () => {
    let res = await client.updateDelegations({
      sequence: 1,
      name: "default",
      delegate: [
        {
          delegator_addr: lcdClientMock.addresses[0],
          validator_addr: lcdClientMock.validators[2],
          bond: { denom: "mycoin", amount: 10 }
        },
        {
          delegator_addr: lcdClientMock.addresses[0],
          validator_addr: lcdClientMock.validators[0],
          bond: { denom: "mycoin", amount: 10 }
        }
      ],
      unbond: []
    })
    expect(res.length).toBe(2)
    expect(res[0].check_tx.log).toBe("")
    expect(res[0].check_tx.code).toBe(0)
    expect(res[1].check_tx.log).toBe("")
    expect(res[1].check_tx.code).toBe(0)

    let stake1 = await client.queryDelegation(
      lcdClientMock.addresses[0],
      lcdClientMock.validators[2]
    )
    expect(stake1.shares).toMatchSnapshot()

    let stake2 = await client.queryDelegation(
      lcdClientMock.addresses[0],
      lcdClientMock.validators[0]
    )
    expect(stake2.shares).toMatchSnapshot()
  })

  it("errors when delegating negative amount", async () => {
    let res = await client.updateDelegations({
      sequence: 1,
      name: "default",
      delegate: [
        {
          delegator_addr: lcdClientMock.addresses[0],
          validator_addr: lcdClientMock.validators[2],
          bond: { denom: "mycoin", amount: -10 }
        }
      ],
      unbond: []
    })
    expect(res.length).toBe(1)
    expect(res[0].check_tx.log).toBe("Amount cannot be negative")
    expect(res[0].check_tx.code).toBe(1)
  })

  it("errors when unbonding with no delegation", async () => {
    let res = await client.updateDelegations({
      sequence: 1,
      name: "default",
      delegate: [],
      unbond: [
        {
          delegator_addr: lcdClientMock.addresses[0],
          validator_addr: lcdClientMock.validators[2],
          shares: "10/1"
        }
      ]
    })
    expect(res.length).toBe(1)
    expect(res[0].check_tx.log).toBe("Nonexistent delegation")
    expect(res[0].check_tx.code).toBe(2)
  })
})
