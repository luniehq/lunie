import { shallowMount, createLocalVue } from "@vue/test-utils"
import Vuelidate from "vuelidate"
import SendModal from "renderer/components/wallet/SendModal"

describe(`SendModal`, () => {
  const localVue = createLocalVue()
  localVue.use(Vuelidate)
  localVue.directive(`focus`, () => { })

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
    session: { signedIn: true }
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
    const $v = { $reset: jest.fn() }
    const address = `cosmos1address`
    const amount = 10
    SendModal.methods.clear.call($v, address, amount)
    expect($v.$reset).toHaveBeenCalled()
    expect(address).toBe(``)
    expect(amount).toBe(0)
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

  describe(`submitForm`, () => {
    it(`submits a transfer transaction`, async () => {
      const $store = { commit: jest.fn() }
      const sendTx = jest.fn()

      await SendModal.methods.submitForm.call(
        {
          amount: 10,
          address: `cosmos1address`,
          denom: `uatom`,
          $store,
          sendTx
        },
        `ledger`, ``
      )

      expect(sendTx).toHaveBeenCalledWith(`submitProposal`,
        {
          type: `send`,
          to: `cosmos1address`,
          amount: [{ amount: `15000000`, denom: `uatom` }],
          submitType: `ledger`,
          password: ``
        }
      )

      expect($store.commit).toHaveBeenCalledWith(`notify`,
        {
          body: `You have successfully submitted a new text proposal`,
          title: `Successful proposal submission!`
        }
      )
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
