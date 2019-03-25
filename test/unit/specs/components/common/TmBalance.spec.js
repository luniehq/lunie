import { shallowMount } from "@vue/test-utils"
import TmBalance from "common/TmBalance"

describe(`TmBalance`, () => {
  let wrapper, $store

  beforeEach(() => {
    $store = {
      getters: {
        connected: true,
        session: {
          address: `cosmos1address`,
          signedIn: true
        },
        liquidAtoms: 1230000000,
        totalAtoms: 3210000000,
        bondDenom: `stake`,
        distribution: {
          loaded: true,
          totalRewards: {
            stake: 1000450000000
          }
        },
        delegation: {
          loaded: true
        },
        wallet: {
          loaded: true
        },
        lastHeader: { height: `10` }
      },
      dispatch: jest.fn()
    }

    wrapper = shallowMount(TmBalance, {
      mocks: {
        $store
      }
    })
  })

  it(`has the expected html structure before adding props`, () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`displays unbonded tokens`, () => {
    expect(wrapper.vm.unbondedAtoms).toBe(`1,230.0000…`)
  })

  it(`displays neither total tokens nor unbonded tokens if not completely loaded`, () => {
    wrapper.vm.wallet.loaded = false
    wrapper.vm.distribution.loaded = false
    expect(wrapper.vm.totalAtomsDisplay).toBe(`--`)
    expect(wrapper.vm.unbondedAtoms).toBe(`--`)
  })

  it(`should not display rewards if not loaded`, () => {
    wrapper.vm.distribution.loaded = false
    expect(wrapper.vm.rewards).toBe(`--`)
  })

  it(`gets user rewards`, () => {
    expect(wrapper.vm.rewards).toBe(`1,000,450.0000…`)
  })

  it(`shows 0 if user doesn't have rewards`, () => {
    wrapper.vm.$store.getters.distribution.totalRewards = {}
    expect(wrapper.vm.rewards).toBe(`0.0000…`)
  })

  it(`opens withdraw modal`, () => {
    const $refs = { modalWithdrawAllRewards: { open: jest.fn() } }
    TmBalance.methods.onWithdrawal.call({ $refs })
    expect($refs.modalWithdrawAllRewards.open).toHaveBeenCalled()
  })

  describe(`update balance and total rewards on new blocks`, () => {
    describe(`shouldn't update`, () => {
      it(`if user is not signed in `, () => {
        const $store = { dispatch: jest.fn() }
        const session = { signedIn: false }
        const newHeader = { height: `10` }
        TmBalance.watch.lastHeader.handler.call(
          { session, $store },
          newHeader)
        expect($store.dispatch).not.toHaveBeenCalledWith(`getTotalRewards`)
        expect($store.dispatch).not.toHaveBeenCalledWith(`queryWalletBalances`)
      })

      it(`if hasn't waited for 10 blocks `, () => {
        const $store = { dispatch: jest.fn() }
        const session = { signedIn: true }
        const newHeader = { height: `12` }
        TmBalance.watch.lastHeader.handler.call(
          { session, $store },
          newHeader)
        expect($store.dispatch).not.toHaveBeenCalledWith(`getTotalRewards`)
        expect($store.dispatch).not.toHaveBeenCalledWith(`queryWalletBalances`)
      })
    })

    describe(`should update balance and rewards `, () => {
      it(`if user is signed in initially`, () => {
        const $store = { dispatch: jest.fn() }
        const session = { signedIn: true }
        const newHeader = { height: `10` }
        TmBalance.watch.lastHeader.handler.call(
          { session, $store, lastUpdate: 0 },
          newHeader)
        expect($store.dispatch).toHaveBeenCalledWith(`getTotalRewards`)
        expect($store.dispatch).toHaveBeenCalledWith(`queryWalletBalances`)
      })

      it(`if user is signed in and wait for 10 blocks`, () => {
        const $store = { dispatch: jest.fn() }
        const session = { signedIn: true }
        const newHeader = { height: `20` }
        TmBalance.watch.lastHeader.handler.call(
          { session, $store, lastUpdate: 15 },
          newHeader)
        expect($store.dispatch).not.toHaveBeenCalled()
        TmBalance.watch.lastHeader.handler.call(
          { session, $store, lastUpdate: 5 },
          newHeader)
        expect($store.dispatch).toHaveBeenCalledWith(`getTotalRewards`)
        expect($store.dispatch).toHaveBeenCalledWith(`queryWalletBalances`)
      })
    })
  })
})
