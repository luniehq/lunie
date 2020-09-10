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
    totalRewardsPerDenom: {
      TOKEN1: 1,
      MUON: 5,
    },
    send: true,
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

  it(`it shows a balance row`, () => {
    const wrapper = shallowMount(BalanceRow, {
      propsData: propsData,
      mocks: {
        $store,
      },
    })
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`it shows an unstaking balance`, () => {
    const endTime = new Date()
    endTime.setDate(endTime.getDate() + 1)
    const wrapper = shallowMount(BalanceRow, {
      propsData: Object.assign({}, propsData, {
        balance: Object.assign({}, propsData.balance, {
          endTime,
        }),
      }),
      mocks: {
        $store,
      },
    })
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`it shows an unstaking balance ready to claim`, () => {
    const endTime = new Date()
    const wrapper = shallowMount(BalanceRow, {
      propsData: Object.assign({}, propsData, {
        balance: Object.assign({}, propsData.balance, {
          endTime,
        }),
      }),
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
    wrapper.find(".table-cell.actions button").trigger("click")
    expect($refs.SendModal.open).toHaveBeenCalled()
  })
})
