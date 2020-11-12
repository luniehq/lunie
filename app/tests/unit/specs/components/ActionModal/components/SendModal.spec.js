import { shallowMount, createLocalVue } from "@vue/test-utils"
import Vuelidate from "vuelidate"
import SendModal from "src/ActionModal/components/SendModal"
import AsyncComputed from "vue-async-computed"

describe(`SendModal`, () => {
  const localVue = createLocalVue()
  localVue.use(Vuelidate)
  localVue.use(AsyncComputed)
  localVue.directive(`focus`, () => {})

  let wrapper, $store

  const getters = {
    connected: true,
    address: "cosmos1thyn8gfapk2d0zsp6dysn99ynhcs2y759kwznx",
    network: "cosmos-hub-mainnet",
    networks: [
      {
        id: "cosmos-hub-mainnet",
        coinLookup: [
          { viewDenom: "STAKE", chainToViewConversionFactor: 0.000001 },
        ],
      },
      {
        id: "terra-mainnet",
        coinLookup: [
          { viewDenom: "LUNA", chainToViewConversionFactor: 0.000001 },
        ],
      },
    ],
    stakingDenom: "STAKE",
  }

  const state = {}

  beforeEach(async () => {
    $store = {
      commit: jest.fn(),
      dispatch: jest.fn(),
      getters,
      state,
    }

    wrapper = shallowMount(SendModal, {
      localVue,
      mocks: {
        $store,
        $apollo: {
          queries: {
            balances: {
              refetch: () => {},
            },
          },
        },
      },
      propsData: {
        denoms: ["STAKE"],
      },
      sync: false,
    })

    wrapper.setData({
      balances: [
        {
          denom: `STAKE`,
          amount: 10000,
        },
      ],
      selectedToken: "STAKE",
    })

    wrapper.vm.$refs.actionModal = {
      submit: (cb) => cb(),
      open: jest.fn(),
    }
    wrapper.vm.open("STAKE")
  })

  it(`should display send modal form`, async () => {
    await waitForTxDataLoaded(wrapper)
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`clears on close`, () => {
    const self = {
      $v: { $reset: jest.fn() },
      address: `cosmos1thyn8gfapk2d0zsp6dysn99ynhcs2y759kwznx`,
      amount: 10,
    }
    SendModal.methods.clear.call(self)
    expect(self.$v.$reset).toHaveBeenCalled()
    expect(self.address).toBe(undefined)
    expect(self.amount).toBe(undefined)
  })

  describe(`validation`, () => {
    it(`should show address required error`, async () => {
      wrapper.setProps({
        denom: `STAKE`,
      })
      wrapper.setData({
        address: ``,
        amount: 2,
      })
      wrapper.vm.validateForm()
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.$v.$error).toBe(true)
      await waitForTxDataLoaded(wrapper)
      expect(wrapper.element).toMatchSnapshot()
    })

    it(`should show bech32 error when address is not bech32`, async () => {
      wrapper.setProps({
        denom: `STAKE`,
      })
      wrapper.setData({
        address: `cosmos1thyn8gfapk2d0zsp6dysn99ynhcs2y759kwznx1234767`,
        amount: 2,
      })
      const valid = wrapper.vm.validateForm()
      expect(valid).toBe(false)
      await wrapper.vm.$nextTick()
      await waitForTxDataLoaded(wrapper)
      expect(wrapper.element).toMatchSnapshot()
    })

    it(`should show an error if trying to send more then the max amount of tokens`, async () => {
      wrapper.setProps({
        denom: `STAKE`,
      })
      wrapper.setData({
        address: `cosmos1thyn8gfapk2d0zsp6dysn99ynhcs2y759kwznx1234767`,
        amount: 1000,
      })
      const valid = wrapper.vm.validateForm()
      expect(valid).toBe(false)
      await wrapper.vm.$nextTick()
      await waitForTxDataLoaded(wrapper)
      expect(wrapper.element).toMatchSnapshot()
    })
  })

  it(`should submit when enterPressed is called`, async () => {
    const self = {
      $refs: { actionModal: { validateChangeStep: jest.fn() } },
    }
    SendModal.methods.enterPressed.call(self)
    expect(self.$refs.actionModal.validateChangeStep).toHaveBeenCalled()
  })

  it(`should set selectedToken to the first balance denom in balances`, () => {
    wrapper.setData({
      balances: [
        {
          denom: `STAKE`,
          amount: 10000,
        },
      ],
      selectedToken: undefined,
    })
    wrapper.vm.open()
    expect(wrapper.vm.selectedToken).toBe("STAKE")
  })

  it(`should refocus on amount when focusOnAmount is called`, async () => {
    const self = {
      $refs: { amount: { $el: { focus: jest.fn() } } },
    }
    SendModal.methods.refocusOnAmount.call(self)
    expect(self.$refs.amount.$el.focus).toHaveBeenCalled()
  })

  it(`validates bech32 addresses`, () => {
    expect(
      wrapper.vm.bech32Validate(`cosmos1x7wzdumfj8pncd99mqc0mkqfrrps3l3pjz8tk6`)
    ).toBe(true)
    expect(
      wrapper.vm.bech32Validate(`cosmos15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9`)
    ).toBe(false)
  })

  it("should return transaction data in correct form", async () => {
    wrapper.setProps({
      denom: `STAKE`,
    })
    wrapper.setData({
      address: `cosmos12345`,
      amount: 2,
    })
    await waitForTxDataLoaded(wrapper)
    expect(wrapper.vm.transactionData).toEqual({
      type: "SendTx",
      amount: {
        amount: 2,
        denom: "STAKE",
      },
      memo: "",
      to: ["cosmos12345"],
      from: ["cosmos1thyn8gfapk2d0zsp6dysn99ynhcs2y759kwznx"],
    })
  })

  it("should return empty transaction data if amount is NaN", () => {
    wrapper.setProps({
      denom: `STAKE`,
    })
    wrapper.setData({
      address: `cosmos12345`,
      amount: `NaN`,
    })
    expect(wrapper.vm.transactionData).toEqual({})
  })

  it(`sends an event on success`, () => {
    const self = {
      $emit: jest.fn(),
    }
    SendModal.methods.onSuccess.call(self)
    expect(self.$emit).toHaveBeenCalledWith(
      "success",
      expect.objectContaining({})
    )
  })

  it("should return notification message", () => {
    wrapper.setProps({
      denom: `STAKE`,
    })
    wrapper.setData({
      address: `cosmos12345`,
      amount: 2,
    })
    expect(wrapper.vm.notifyMessage).toEqual({
      title: `Successful Send`,
      body: `Successfully sent 2 STAKEs to cosm…2345`,
    })
  })

  describe(`if amount field max button clicked`, () => {
    it(`amount has to be 10000 atom`, async () => {
      wrapper.setProps({
        denom: `STAKE`,
      })
      wrapper.setData({
        address: `cosmos12345`,
      })
      wrapper.vm.setMaxAmount()
      expect(wrapper.vm.amount).toBe(10000)
    })
    it(`should show warning message`, async () => {
      wrapper.setProps({
        denom: `STAKE`,
      })
      wrapper.setData({
        address: `cosmos12345`,
      })
      wrapper.vm.setMaxAmount()
      await wrapper.vm.$nextTick()
      expect(wrapper.html()).toContain(
        "You are about to use all your tokens for this transaction. Consider leaving a little bit left over to cover the network fees."
      )
    })
    it(`should not show warning message if balance = 0`, async () => {
      wrapper.setData({
        balances: [
          {
            amount: 0,
            denom: "STAKE",
          },
        ],
      })
      wrapper.vm.setMaxAmount()
      await wrapper.vm.$nextTick()
      expect(wrapper.html()).not.toContain(
        "You are about to use all your tokens for this transaction. Consider leaving a little bit left over to cover the network fees."
      )
    })
    it(`isMaxAmount() should return false if balance = 0`, async () => {
      wrapper.setData({
        balances: [
          {
            amount: 0,
            denom: "STAKE",
          },
        ],
      })
      wrapper.vm.setMaxAmount()
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.isMaxAmount()).toBe(false)
    })

    it(`setMaxAmount should deduct the Terra tax from total balance when sending alt-tokens in Terra`, () => {
      const self = {
        network: "terra-mainnet",
        amount: 0.000001,
        selectedBalance: {
          amount: 1,
          denom: "STAKE",
        },
        getTerraTax: SendModal.methods.getTerraTax,
        maxDecimals: SendModal.methods.maxDecimals,
        networkFeesLoaded: true,
        networkFees: {
          transactionFee: {
            amount: 0.0075,
            denom: "STAKE",
          },
        },
      }
      const maxAmount = SendModal.computed.maxAmount.call(self)
      expect(maxAmount).toBe(0.9925)
      self.maxAmount = maxAmount
      SendModal.methods.setMaxAmount.call(self)
      expect(self.amount).toBe(0.9925)
    })
  })

  describe(`Set token and balance`, () => {
    it(`it takes the corresponding balance from the balances array when
    selectedToken has been chosen and balances has a length over 1`, async () => {
      wrapper.setData({
        selectedToken: `TOKEN1`,
        balances: [
          {
            amount: 1,
            denom: "TOKEN1",
          },
          {
            amount: 2,
            denom: "TOKEN2",
          },
        ],
      })
      expect(wrapper.vm.selectedBalance.amount).toBe(1)
    })

    it(`it automatically sets the token to the first token in the balances`, async () => {
      wrapper.setData({
        selectedToken: ``,
        balances: [
          {
            amount: 1,
            denom: "STAKE",
          },
        ],
      })
      SendModal.watch.balances.call(wrapper.vm, [
        {
          amount: 1,
          denom: "STAKE",
        },
      ])
      expect(wrapper.vm.selectedBalance.amount).toBe(1)
    })
    // This one creates a lot of ugly errors
    // it(`returns empty string if selectedToken hasn't been chosen yet`, () => {
    //   wrapper.setData({
    //     balances: []
    //   })
    //   const res = wrapper.vm.token()
    //   expect(res).toBe("")
    // })
    it(`returns selectedToken if selectedToken has been chosen`, () => {
      const res = wrapper.vm.token()
      expect(res).toBe("STAKE")
    })
  })
})

async function waitForTxDataLoaded(wrapper) {
  // need to wait for transactionData to be resolved (very dirty solution)
  while (wrapper.vm.$asyncComputed.transactionData.updating) {
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
  await new Promise((resolve) => setTimeout(resolve, 100))
}
