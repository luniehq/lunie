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
        }
      }
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
})
