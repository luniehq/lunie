describe('LCD Client', () => {
  let client

  beforeEach(() => {
    jest.resetModules()
    let lcdClientMock = require('renderer/connectors/lcdClientMock.js')
    client = lcdClientMock
  })

  it('shows a connected state', async () => {
    expect(await client.lcdConnected()).toBe(true)
  })

  it('generates and persists keys', async () => {
    let res = await client.generateKey({ name: 'foo', password: '1234567890' })
    expect(res.name).toBe('foo')

    res = await client.listKeys()
    expect(res.find(k => k.name === 'foo')).toBeDefined()

    res = await client.getKey('foo')
    expect(res.name).toBe('foo')
  })

  it('updates keys', async () => {
    let res = await client.recoverKey({
      name: 'foo', password: '1234567890', seed_phrase: 'seed some thin'
    })

    res = await client.updateKey('foo', {
      name: 'foo', password: '1234567890', new_passphrase: '12345678901'
    })
    await expect(client.updateKey('foo', {
      name: 'foo', password: '1234567890', new_passphrase: '12345678901'
    })).rejects.toThrowErrorMatchingSnapshot()

    res = await client.getKey('foo')
    expect(res.name).toBe('foo')
  })

  it('deletes keys', async () => {
    let res = await client.generateKey({ name: 'foo', password: '1234567890' })

    await expect(client.deleteKey('foo', { name: 'foo', password: '___' })).rejects.toThrowErrorMatchingSnapshot()
    await client.deleteKey('foo', { name: 'foo', password: '1234567890' })
    res = await client.getKey('foo')
    expect(res).toBeUndefined()
  })

  it('builds a tx', async () => {
    let { address: fromAddr } = await client.generateKey({ name: 'foo', password: '1234567890' })
    let { address: toAddr } = await client.generateKey({ name: 'bar', password: '1234567890' })
    let tx = await client.buildSend({
      sequence: 0,
      from: { addr: fromAddr },
      to: { addr: toAddr },
      fees: [],
      amount: [{
        denom: 'mycoin',
        amount: 50
      }]
    })
    expect(tx.type).toBe('sigs/one')
  })

  it('signes a tx', async () => {
    let { address: fromAddr } = await client.generateKey({ name: 'foo', password: '1234567890' })
    let { address: toAddr } = await client.generateKey({ name: 'bar', password: '1234567890' })
    let tx = await client.buildSend({
      sequence: 0,
      from: { addr: fromAddr },
      to: { addr: toAddr },
      fees: [],
      amount: [{
        denom: 'mycoin',
        amount: 50
      }]
    })
    let signedTx = await client.sign({
      name: 'foo', password: '1234567890', tx
    })
    expect(signedTx.data.signature).toBeDefined()
  })

  it('persists a posted tx', async () => {
    let res = await client.coinTxs('DF096FDE8D380FA5B2AD20DB2962C82DDEA1ED9B')
    expect(res.length).toBe(2) // predefined txs

    let { address: toAddr } = await client.generateKey({ name: 'bar', password: '1234567890' })
    let tx = await client.buildSend({
      sequence: 0,
      from: { addr: 'DF096FDE8D380FA5B2AD20DB2962C82DDEA1ED9B' },
      to: { addr: toAddr },
      fees: [],
      amount: [{
        denom: 'mycoin',
        amount: 50
      }]
    })
    let signedTx = await client.sign({
      name: 'foo', password: '1234567890', tx
    })
    res = await client.postTx(signedTx)
    expect(res.height).toBeDefined()

    res = await client.coinTxs('DF096FDE8D380FA5B2AD20DB2962C82DDEA1ED9B')
    expect(res.length).toBe(3)
  })

  it('query and update the nonce', async () => {
    let nonce = await client.queryNonce('DF096FDE8D380FA5B2AD20DB2962C82DDEA1ED9B')
    expect(nonce).toBe(0)

    let { address: toAddr } = await client.generateKey({ name: 'bar', password: '1234567890' })
    let tx = await client.buildSend({
      sequence: 0,
      from: { addr: 'DF096FDE8D380FA5B2AD20DB2962C82DDEA1ED9B' },
      to: { addr: toAddr },
      fees: [],
      amount: [{
        denom: 'mycoin',
        amount: 50
      }]
    })
    let signedTx = await client.sign({
      name: 'foo', password: '1234567890', tx
    })
    await client.postTx(signedTx)
    nonce = await client.queryNonce('DF096FDE8D380FA5B2AD20DB2962C82DDEA1ED9B')
    expect(nonce).toBe(1)
  })

  it('queries an account', async () => {
    let { data } = await client.queryAccount('DF096FDE8D380FA5B2AD20DB2962C82DDEA1ED9B')
    expect(data.coins.find(c => c.denom === 'mycoin').amount).toBe(1000)

    let res = await client.queryAccount('address_doesnt_exist')
    expect(res).toBe(null)
  })

  it('sends coins', async () => {
    let { address: toAddr } = await client.generateKey({ name: 'bar', password: '1234567890' })
    let tx = await client.buildSend({
      sequence: 0,
      from: { addr: 'DF096FDE8D380FA5B2AD20DB2962C82DDEA1ED9B' },
      to: { addr: toAddr },
      fees: [],
      amount: [{
        denom: 'mycoin',
        amount: 50
      }]
    })
    let signedTx = await client.sign({
      name: 'foo', password: '1234567890', tx
    })
    let res = await client.postTx(signedTx)
    expect(res.check_tx.code).toBe(0)

    let { data: account } = await client.queryAccount('DF096FDE8D380FA5B2AD20DB2962C82DDEA1ED9B')
    expect(account.coins.find(c => c.denom === 'mycoin').amount).toBe(950)

    let { data: receiveAccount } = await client.queryAccount(toAddr)
    expect(receiveAccount.coins.find(c => c.denom === 'mycoin').amount).toBe(50)
  })

  it('fails to send coins you dont have', async () => {
    let { address: toAddr } = await client.generateKey({ name: 'bar', password: '1234567890' })
    let tx = await client.buildSend({
      sequence: 0,
      from: { addr: 'DF096FDE8D380FA5B2AD20DB2962C82DDEA1ED9B' },
      to: { addr: toAddr },
      fees: [],
      amount: [{
        denom: 'mycoin',
        amount: 100000
      }]
    })
    let signedTx = await client.sign({
      name: 'foo', password: '1234567890', tx
    })
    let res = await client.postTx(signedTx)
    expect(res.check_tx.code).toBe(1)
  })

  it('queries for a candidate', async () => {
    let { data } = await client.candidate('88564A32500A120AA72CEFBCF5462E078E5DDB70B6431F59F778A8DC4DA719A4')
    expect(data.address).not.toBeFalsy()
  })

  it('queries for all candidates', async () => {
    let { data } = await client.candidates()
    expect(data.length).toBeGreaterThan(0)
  })

  it('builds a delegate tx', async () => {
    let res = await client.buildDelegate({
      sequence: 0,
      from: { addr: 'foo' },
      amount: 10,
      pubkey: 'abc'
    })
    expect(res.type).toBe('sigs/one')
  })

  it('queries bondings per delegator', async () => {
    let res = await client.bondingsByDelegator(['DF096FDE8D380FA5B2AD20DB2962C82DDEA1ED9B', '7A9D783CE542B23FA23DC7F101460879861205772606B4C3FAEAFBEDFB00E7BD'])
    expect(res.data.Shares).toBe(5)
  })

  it('executes a delegate tx', async () => {
    let { data: stake } = await client.bondingsByDelegator(['DF096FDE8D380FA5B2AD20DB2962C82DDEA1ED9B', '88564A32500A120AA72CEFBCF5462E078E5DDB70B6431F59F778A8DC4DA719A4'])
    expect(stake.Shares).toBe(0)

    let tx = await client.buildDelegate({
      sequence: 0,
      from: { addr: 'DF096FDE8D380FA5B2AD20DB2962C82DDEA1ED9B' },
      amount: 10,
      pubkey: '88564A32500A120AA72CEFBCF5462E078E5DDB70B6431F59F778A8DC4DA719A4'
    })
    let signedTx = await client.sign({
      name: 'foo', password: '1234567890', tx
    })
    let res = await client.postTx(signedTx)
    expect(res.check_tx.code).toBe(0)

    let { data: updatedStake } = await client.bondingsByDelegator(['DF096FDE8D380FA5B2AD20DB2962C82DDEA1ED9B', '88564A32500A120AA72CEFBCF5462E078E5DDB70B6431F59F778A8DC4DA719A4'])
    expect(updatedStake.Shares).toBe(10)
  })

  it('can not stake fermions you dont have', async () => {
    let tx = await client.buildDelegate({
      sequence: 0,
      from: { addr: 'DF096FDE8D380FA5B2AD20DB2962C82DDEA1ED9B' },
      amount: 100000000,
      pubkey: '88564A32500A120AA72CEFBCF5462E078E5DDB70B6431F59F778A8DC4DA719A4'
    })
    let signedTx = await client.sign({
      name: 'foo', password: '1234567890', tx
    })
    let res = await client.postTx(signedTx)
    expect(res.check_tx.code).toBe(1)
  })
})
