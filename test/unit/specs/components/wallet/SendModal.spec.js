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
      amount: 1000
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
    connected: true
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
      }
    })

    wrapper.vm.$refs.actionModal = {
      submit: cb => cb()
    }
  })

  it(`has the expected html structure`, async () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`should show address required error`, async () => {
    wrapper.setData({
      fields: {
        denom: `STAKE`,
        address: ``,
        amount: 2
      }
    })
    wrapper.vm.validateForm()
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.$v.$error).toBe(true)
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`should show bech32 error when address length is too short`, async () => {
    wrapper.setData({
      fields: {
        denom: `STAKE`,
        address: `asdf`,
        amount: 2
      }
    })
    wrapper.vm.validateForm()
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.$v.$error).toBe(true)
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`should show bech32 error when address length is too long`, async () => {
    wrapper.setData({
      fields: {
        denom: `STAKE`,
        address: `asdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdf`,
        amount: 2
      }
    })
    wrapper.vm.validateForm()
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.$v.$error).toBe(true)
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`should show bech32 error when alphanumeric is wrong`, async () => {
    wrapper.vm.validateForm()
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.$v.$error).toBe(true)
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`should show notification for successful send`, async () => {
    wrapper.setData({
      fields: {
        denom: `STAKE`,
        address,
        amount: 2
      }
    })
    await wrapper.vm.submitForm(`local`, `1234567890`)
    // walletSend is async so we need to wait until it is resolved
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
