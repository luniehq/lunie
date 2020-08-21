import { shallowMount } from "@vue/test-utils"
import BalanceRow from "common/BalanceRow"

describe(`BalanceRow`, () => {
  let wrapper, $store

  const propsData = {
    balance: {
      type: "STAKE",
      denom: "MUON",
      available: "80.780405",
      total: "100.780405",
      fiatValue: {
        amount: "10",
        denom: "USD",
        symbol: "$",
      },
    },
    totalRewardsDenom: {
      TOKEN1: 1,
      MUON: 5,
    },
  }

  beforeEach(async () => {
    $store = {
      getters: {
        currentNetwork: {
          id: "test-network",
          testnet: false,
          coinLookup: [
            {
              viewDenom: `MUON`,
              icon: `/img/icons/currencies/muon.png`,
            },
          ],
        },
        stakingDenom: "MUON",
        networks: [
          {
            id: "test-network",
            testnet: false,
          },
        ],
      },
    }

    wrapper = shallowMount(BalanceRow, {
      props: propsData,
      mocks: {
        $store,
      },
    })
  })

  it.skip(`it matches snapshot`, () => {
    expect(wrapper.element).toMatchSnapshot()
  })

  it.skip(`opens send modal`, () => {
    const $refs = {
      SendModal: {
        open: jest.fn(),
      },
    }
    wrapper.vm.$refs = $refs
    wrapper.find(".table-cell.actions button").trigger("click")
    expect($refs.SendModal.open).toHaveBeenCalled()
  })
})
