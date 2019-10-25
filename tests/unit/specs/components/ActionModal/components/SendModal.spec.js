import { shallowMount, createLocalVue } from "@vue/test-utils"
import Vuelidate from "vuelidate"
import SendModal from "src/ActionModal/components/SendModal"

describe(`SendModal`, () => {
  const localVue = createLocalVue()
  localVue.use(Vuelidate)
  localVue.directive(`focus`, () => { })

  let wrapper, $store

  const getters = {
    connected: true,
    session: { signedIn: true, address: "cosmos1234" }
  }

  const state = {
  }

  beforeEach(async () => {
    $store = {
      commit: jest.fn(),
      dispatch: jest.fn(),
      getters,
      state
    }

    wrapper = shallowMount(SendModal, {
      localVue,
      mocks: {
        $store
      },
      propsData: {
        denom: "STAKE"
      },
      sync: false
    })

    wrapper.setData({
      balance: {
        denom: `STAKE`,
        amount: 10000
      }
    })

    wrapper.vm.$refs.actionModal = {
      submit: cb => cb(),
      open: jest.fn()
    }
    wrapper.vm.open("stake")
  })

  it(`should display send modal form`, async () => {
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`clears on close`, () => {
    const self = {
      $v: { $reset: jest.fn() },
      address: `cosmos1address`,
      amount: 10
    }
    SendModal.methods.clear.call(self)
    expect(self.$v.$reset).toHaveBeenCalled()
    expect(self.address).toBe(undefined)
    expect(self.amount).toBe(undefined)
  })

  it(`shows the memo input if desired`, async () => {
    wrapper.find("#edit-memo-btn").trigger("click")
    await wrapper.vm.$nextTick()

    expect(wrapper.find("#memo").isVisible()).toBe(true)
  })

  describe(`validation`, () => {
    it(`should show address required error`, async () => {
      wrapper.setProps({
        denom: `STAKE`
      })
      wrapper.setData({
        address: ``,
        amount: 2
      })
      wrapper.vm.validateForm()
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.$v.$error).toBe(true)
      expect(wrapper.element).toMatchSnapshot()
    })
    it(`should show bech32 error when address length is too short`, async () => {
      wrapper.setProps({
        denom: `STAKE`
      })
      wrapper.setData({
        address: `asdf`,
        amount: 2
      })
      wrapper.vm.validateForm()
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.$v.$error).toBe(true)
      expect(wrapper.element).toMatchSnapshot()
    })

    it(`should show bech32 error when address length is too long`, async () => {
      wrapper.setProps({
        denom: `STAKE`
      })
      wrapper.setData({
        address: `asdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdf`,
        amount: 2
      })
      wrapper.vm.validateForm()
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.$v.$error).toBe(true)
      expect(wrapper.element).toMatchSnapshot()
    })
    it(`should show bech32 error when alphanumeric is wrong`, async () => {
      wrapper.setData({
        address: ``
      })
      expect(wrapper.vm.validateForm()).toBe(false)
      await wrapper.vm.$nextTick()
      expect(wrapper.element).toMatchSnapshot()
    })
  })

  it(`should submit when enterPressed is called`, async () => {
    const self = {
      $refs: { actionModal: { validateChangeStep: jest.fn() } }
    }
    SendModal.methods.enterPressed.call(self)
    expect(self.$refs.actionModal.validateChangeStep).toHaveBeenCalled()
  })

  it(`should refocus on amount when focusOnAmount is called`, async () => {
    const self = {
      $refs: { amount: { $el: { focus: jest.fn() } } }
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

  it("should return transaction data in correct form", () => {
    wrapper.setProps({
      denom: `STAKE`
    })
    wrapper.setData({
      address: `cosmos12345`,
      amount: 2
    })
    expect(wrapper.vm.transactionData).toEqual({
      type: "MsgSend",
      toAddress: "cosmos12345",
      amounts: [{ amount: "2000000", denom: "stake" }],
      memo: "(Sent via Lunie)"
    })
  })

  it("should return notification message", () => {
    wrapper.setProps({
      denom: `STAKE`
    })
    wrapper.setData({
      address: `cosmos12345`,
      amount: 2
    })
    expect(wrapper.vm.notifyMessage).toEqual({
      title: `Successful Send`,
      body: `Successfully sent 2 STAKEs to cosmos12345`
    })
  })

  describe(`if amount field max button clicked`, () => {
    it(`amount has to be 10000 atom`, async () => {
      wrapper.setProps({
        denom: `STAKE`
      })
      wrapper.setData({
        address: `cosmos12345`
      })
      wrapper.vm.setMaxAmount()
      expect(wrapper.vm.amount).toBe(10000)
    })
    it(`should show warning message`, async () => {
      wrapper.setProps({
        denom: `STAKE`
      })
      wrapper.setData({
        address: `cosmos12345`
      })
      wrapper.vm.setMaxAmount()
      await wrapper.vm.$nextTick()
      expect(wrapper.html()).toContain(
        "You are about to use all your tokens for this transaction. Consider leaving a little bit left over to cover the network fees."
      )
    })
    it(`should not show warning message if balance = 0`, async () => {
      wrapper.setData({
        balance: {
          amount: 0,
          denom: "STAKE"
        }
      })
      wrapper.vm.setMaxAmount()
      await wrapper.vm.$nextTick()
      expect(wrapper.html()).not.toContain(
        "You are about to use all your tokens for this transaction. Consider leaving a little bit left over to cover the network fees."
      )
    })
    it(`isMaxAmount() should return false if balance = 0`, async () => {
      wrapper.setData({
        balance: {
          amount: 0,
          denom: "STAKE"
        }
      })
      wrapper.vm.setMaxAmount()
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.isMaxAmount()).toBe(false)
    })
  })
})
