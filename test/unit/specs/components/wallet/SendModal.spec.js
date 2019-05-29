import { shallowMount, createLocalVue } from "@vue/test-utils"
import Vuelidate from "vuelidate"
import SendModal from "src/components/wallet/SendModal"

describe(`SendModal`, () => {
  const localVue = createLocalVue()
  localVue.use(Vuelidate)
  localVue.directive(`focus`, () => {})

  let wrapper, $store

  const balances = [
    {
      denom: `STAKE`,
      amount: 10000000000
    },
    {
      denom: `fermion`,
      amount: 2300
    }
  ]
  const getters = {
    wallet: {
      loading: false,
      denoms: [`fermion`, `gregcoin`, `mycoin`, `STAKE`],
      balances
    },
    connected: true,
    session: { signedIn: true, address: "cosmos1234" }
  }

  beforeEach(async () => {
    $store = {
      commit: jest.fn(),
      dispatch: jest.fn(),
      getters
    }

    wrapper = shallowMount(SendModal, {
      localVue,
      propsData: {
        denom: `STAKE`
      },
      mocks: {
        $store
      },
      sync: false
    })

    wrapper.vm.$refs.actionModal = {
      submit: cb => cb(),
      open: jest.fn()
    }
  })

  it(`should display send modal form`, async () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`clears on close`, () => {
    const self = {
      $v: { $reset: jest.fn() },
      address: `cosmos1address`,
      amount: 10
    }
    SendModal.methods.clear.call(self)
    expect(self.$v.$reset).toHaveBeenCalled()
    expect(self.address).toBe(``)
    expect(self.amount).toBe(0)
  })

  it(`shows the memo input if desired`, () => {
    wrapper.setData({
      editMemo: true
    })

    expect(wrapper.exists("#memo")).toBe(true)
  })

  describe(`validation`, () => {
    it(`should show address required error`, async () => {
      wrapper.setData({
        denom: `STAKE`,
        address: ``,
        amount: 2
      })
      wrapper.vm.validateForm()
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.$v.$error).toBe(true)
      expect(wrapper.vm.$el).toMatchSnapshot()
    })
    it(`should show bech32 error when address length is too short`, async () => {
      wrapper.setData({
        denom: `STAKE`,
        address: `asdf`,
        amount: 2
      })
      wrapper.vm.validateForm()
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.$v.$error).toBe(true)
      expect(wrapper.vm.$el).toMatchSnapshot()
    })

    it(`should show bech32 error when address length is too long`, async () => {
      wrapper.setData({
        denom: `STAKE`,
        address: `asdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdf`,
        amount: 2
      })
      wrapper.vm.validateForm()
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.$v.$error).toBe(true)
      expect(wrapper.vm.$el).toMatchSnapshot()
    })
    it(`should show bech32 error when alphanumeric is wrong`, async () => {
      wrapper.setData({
        address: ``
      })
      expect(wrapper.vm.validateForm()).toBe(false)
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.$el).toMatchSnapshot()
    })
  })

  describe(`simulateForm`, () => {
    it(`should simulate transaction to estimate gas used`, async () => {
      const estimate = 1234567
      const $store = { dispatch: jest.fn(() => estimate) }
      const res = await SendModal.methods.simulateForm.call({
        $store,
        amount: 10,
        address: `cosmos1address`,
        denom: `uatom`,
        memo: `TESTING (Sent via Lunie)`
      })

      expect($store.dispatch).toHaveBeenCalledWith(`simulateTx`, {
        type: `MsgSend`,
        txArguments: {
          toAddress: `cosmos1address`,
          amounts: [{ amount: `10000000`, denom: `uatom` }]
        },
        memo: `TESTING (Sent via Lunie)`
      })
      expect(res).toBe(estimate)
    })
  })

  describe(`submitForm`, () => {
    it(`submits a transfer transaction`, async () => {
      const $store = { commit: jest.fn() }
      const sendTx = jest.fn()
      const gas = `1234567`
      const gasPrice = 2.5e-8
      const gas_prices = [{ denom: `uatom`, amount: `0.025` }]

      await SendModal.methods.submitForm.call(
        {
          amount: 10,
          address: `cosmos1address`,
          denom: `uatom`,
          bondDenom: `uatom`,
          $store,
          sendTx,
          memo: `TESTING (Sent via Lunie)`,
          session: {
            address: "cosmos1234"
          }
        },
        gas,
        gasPrice,
        ``,
        `ledger`
      )

      expect(sendTx).toHaveBeenCalledWith({
        type: `MsgSend`,
        txArguments: {
          toAddress: `cosmos1address`,
          amounts: [{ amount: `10000000`, denom: `uatom` }]
        },
        gas,
        gas_prices,
        submitType: `ledger`,
        password: ``,
        memo: `TESTING (Sent via Lunie)`
      })

      expect($store.commit).toHaveBeenCalledWith(`notify`, {
        body: `Successfully sent 10 ATOMs to cosmos1address`,
        title: `Successful Send`
      })
    })
  })
  it(`validates bech32 addresses`, () => {
    expect(
      wrapper.vm.bech32Validate(`cosmos1x7wzdumfj8pncd99mqc0mkqfrrps3l3pjz8tk6`)
    ).toBe(true)
    expect(
      wrapper.vm.bech32Validate(`cosmos15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9`)
    ).toBe(false)
  })
})
