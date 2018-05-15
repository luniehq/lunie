import setup from "../../helpers/vuex-setup"

let instance = setup()

describe("Module: Wallet", () => {
  let store, node

  beforeEach(() => {
    let test = instance.shallow(null)
    store = test.store
    node = test.node
  })

  // DEFAULT

  it("should have an empty state by default", () => {
    const state = {
      balances: [],
      balancesLoading: true,
      history: [],
      historyLoading: false,
      denoms: [],
      address: null,
      zoneIds: ["basecoind-demo1", "basecoind-demo2"]
    }
    expect(store.state.wallet).toEqual(state)
  })

  // MUTATIONS

  it("should set wallet balances ", () => {
    const balances = [{ denom: "leetcoin", amount: "1337" }]
    store.commit("setWalletBalances", balances)
    expect(store.state.wallet.balances).toBe(balances)
  })

  it("should set wallet key and clear balance ", () => {
    const address = "address123"
    store.commit("setWalletAddress", address)
    expect(store.state.wallet.address).toBe(address)
    expect(store.state.wallet.balances).toEqual([])
  })

  it("should set wallet history", () => {
    const history = ["once", "upon", "a", "time"]
    store.commit("setWalletHistory", history)
    expect(store.state.wallet.history).toBe(history)
  })

  it("should set denoms", () => {
    const denoms = ["acoin", "bcoin", "ccoin"]
    store.commit("setDenoms", denoms)
    expect(store.state.wallet.denoms).toBe(denoms)
  })

  it("should set transaction time", () => {
    const blockHeight = 31337
    const time = 1234567890
    const history = [{ height: blockHeight }]
    const blockMetaInfo = { header: { time: time } }
    store.commit("setWalletHistory", history)
    store.commit("setTransactionTime", { blockHeight, blockMetaInfo })
    expect(store.state.wallet.history[0].time).toBe(time)
  })

  // ACTIONS

  it("should initialize wallet", async () => {
    const address = "DC97A6E1A3E1FE868B55BA93C7FC626368261E09"
    await store.dispatch("initializeWallet", address)
    expect(store.state.wallet.address).toEqual(address)
  })

  it("should query wallet state", async () => {
    store.dispatch("queryWalletState")
    expect(store.state.wallet.balances).toEqual([])
    expect(store.state.wallet.history).toEqual([])
    expect(store.state.send.nonce).toBe(0)
  })

  it("should query wallet balances", async () => {
    node.queryAccount = () =>
      Promise.resolve({
        coins: [
          {
            denom: "fermion",
            amount: 42
          }
        ]
      })
    await store.dispatch("queryWalletBalances")
    expect(store.state.wallet.balances).toEqual([
      {
        amount: 42,
        denom: "fermion"
      }
    ])
  })

  describe("query meta info", () => {
    let height = 100
    let blockMeta = {
      header: {
        height: 100,
        time: 42
      }
    }

    beforeEach(() => {
      // prefill history
      store.commit("setWalletHistory", [{ height }])
      // prefill block metas
      store.state.blockchain.blockMetas = [blockMeta]
    })

    it("should query transaction time", async () => {
      await store.dispatch("queryTransactionTime", height)
      expect(store.state.wallet.history[0].time).toBe(42)
    })
  })

  it("should load denoms", async () => {
    await store.dispatch("loadDenoms")
    expect(store.state.wallet.denoms).toEqual(["mycoin", "fermion", "gregcoin"])
  })

  xit("should enrich transaction times", async () => {
    node.coinTxs = () =>
      Promise.resolve([
        {
          tx: {},
          height: 1
        },
        {
          tx: {},
          height: 2
        },
        {
          tx: {},
          height: 2
        }
      ])
    node.rpc.blockchain = ({ minHeight, maxHeight }, cb) => {
      cb(null, {
        block_metas: [
          {
            header: {
              height: minHeight,
              time: minHeight
            }
          }
        ]
      })
    }
    jest.spyOn(node.rpc, "blockchain")
    await store.dispatch("queryWalletHistory")
    expect(node.rpc.blockchain.mock.calls.length).toBe(2)
    expect(store.state.wallet.history[0].time).toBe(1)
    expect(store.state.wallet.history[1].time).toBe(2)
  })

  it("should query the balances on reconnection", () => {
    store.state.node.stopConnecting = true
    store.state.wallet.balancesLoading = true
    jest.spyOn(node, "queryAccount")
    store.dispatch("reconnected")
    expect(node.queryAccount).toHaveBeenCalled()
  })

  it("should not query the balances on reconnection if not stuck in loading", () => {
    store.state.node.stopConnecting = true
    store.state.wallet.balancesLoading = false
    jest.spyOn(node, "queryAccount")
    store.dispatch("reconnected")
    expect(node.queryAccount).not.toHaveBeenCalled()
  })

  xit("should query the history on reconnection", () => {
    store.state.node.stopConnecting = true
    store.state.wallet.historyLoading = true
    jest.spyOn(node, "coinTxs")
    store.dispatch("reconnected")
    expect(node.coinTxs).toHaveBeenCalled()
  })

  xit("should not query the history on reconnection if not stuck in loading", () => {
    store.state.node.stopConnecting = true
    store.state.wallet.historyLoading = false
    jest.spyOn(node, "coinTxs")
    store.dispatch("reconnected")
    expect(node.coinTxs).not.toHaveBeenCalled()
  })

  it("should be in loading state before querying account, and not in loading state after", async () => {
    node.queryAccount = () =>
      Promise.resolve({
        coins: [
          {
            denom: "fermion",
            amount: 42
          }
        ]
      })

    expect(store.state.wallet.balancesLoading).toBe(true)
    await store.dispatch("initializeWallet", "someAddress")
    expect(store.state.wallet.balancesLoading).toBe(false)
  })
})
