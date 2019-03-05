import { shallowMount, createLocalVue } from "@vue/test-utils"
import Vuelidate from "vuelidate"
import SendModal from "renderer/components/wallet/SendModal"

describe(`SendModal`, () => {
  const localVue = createLocalVue()
  localVue.use(Vuelidate)
  localVue.directive(`focus`, () => {})

  let wrapper, $store
  const address = `tb1mjt6dcdru8lgdz64h2fu0lrzvd5zv8sfcvkv2l`

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

  it(`has the expected html structure`, async () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  // do when refactoring the test
  xit(`clears on close`, () => {
    wrapper.vm.$v.$reset = jest.fn()
    wrapper.setData({ address: `test`, amount: 5 })
    wrapper.vm.close()
    expect(wrapper.vm.$v.$reset).toHaveBeenCalled()
    expect(wrapper.vm.address).toBe(``)
    expect(wrapper.vm.amount).toBe(0)
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

  it(`should show notification for successful send`, async () => {
    wrapper.setData({
      denom: `STAKE`,
      address,
      amount: 2
    })
    await wrapper.vm.submitForm(`local`, `1234567890`)

    expect($store.commit).toHaveBeenCalledWith(`notify`, expect.any(Object))
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
