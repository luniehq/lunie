import { shallowMount } from "@vue/test-utils"
import BalanceRow from "common/BalanceRow"

describe(`BalanceRow`, () => {
  let $store

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
      endTime: "",
    },
    totalRewardsDenom: {
      TOKEN1: 1,
      MUON: 5,
    },
  }

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

  it(`it matches snapshot`, () => {
    const wrapper = shallowMount(BalanceRow, {
      propsData: propsData,
      mocks: {
        $store,
      },
    })
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`opens send modal`, () => {
    const wrapper = shallowMount(BalanceRow, {
      propsData: propsData,
      mocks: {
        $store,
      },
    })
    const $refs = {
      SendModal: {
        open: jest.fn(),
      },
    }
    wrapper.vm.$refs = $refs
    wrapper.find("#send-button").trigger("click")
    expect($refs.SendModal.open).toHaveBeenCalled()
  })
})
