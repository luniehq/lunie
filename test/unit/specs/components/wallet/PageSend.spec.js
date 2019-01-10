import { shallowMount, createLocalVue } from "@vue/test-utils"
import Vuelidate from "vuelidate"
import PageSend from "renderer/components/wallet/PageSend"

describe(`PageSend`, () => {
  const localVue = createLocalVue()
  localVue.use(Vuelidate)

  let wrapper, $store
  const address = `tb1mjt6dcdru8lgdz64h2fu0lrzvd5zv8sfcvkv2l`

  const balances = [
    {
      denom: `mycoin`,
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

    wrapper = shallowMount(PageSend, {
      localVue,
      propsData: {
        denom: `mycoin`
      },
      mocks: {
        $store
      }
    })
  })

  it(`has the expected html structure`, async () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`should populate the select options with denoms`, () => {
    expect(wrapper.vm.denominations).toEqual([
      {
        key: `MYCOIN`,
        value: `mycoin`
      },
      {
        key: `FERMION`,
        value: `fermion`
      }
    ])
  })

  it(`should work without providing a default denom`, async () => {
    wrapper = shallowMount(PageSend, {
      localVue,
      propsData: {},
      mocks: {
        $store
      }
    })
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`should show address required error`, async () => {
    wrapper.setData({
      fields: {
        denom: `mycoin`,
        address: ``,
        amount: 2,
        password: `1234567890`
      }
    })
    wrapper.vm.onSubmit()
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.$v.$error).toBe(true)
    expect(wrapper.vm.$el).toMatchSnapshot()
  })
  it(`should show bech32 error when address length is too short`, async () => {
    wrapper.setData({
      fields: {
        denom: `mycoin`,
        address: `asdf`,
        amount: 2,
        password: `1234567890`
      }
    })
    wrapper.vm.onSubmit()
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.$v.$error).toBe(true)
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`should show bech32 error when address length is too long`, async () => {
    wrapper.setData({
      fields: {
        denom: `mycoin`,
        address: `asdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdf`,
        amount: 2,
        password: `1234567890`
      }
    })
    wrapper.vm.onSubmit()
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.$v.$error).toBe(true)
    expect(wrapper.vm.$el).toMatchSnapshot()
  })
  it(`should show bech32 error when alphanumeric is wrong`, async () => {
    wrapper.setData({
      fields: {
        denom: `mycoin`,
        address: `!@#$!@#$!@#$!@#$!@#$!@#$!@#$!@#$!@#$!@#$`,
        amount: 2,
        password: `1234567890`
      }
    })
    wrapper.vm.onSubmit()
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.$v.$error).toBe(true)
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`should trigger confirmation modal if form is correct`, async () => {
    wrapper.setData({
      fields: {
        denom: `mycoin`,
        address,
        amount: 2,
        password: `1234567890`
      }
    })
    wrapper.vm.onSubmit()
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.$v.$error).toBe(false)
    expect(wrapper.vm.confirmationPending).toBe(true)
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`should close confirmation modal on cancel`, async () => {
    wrapper.vm.confirmationPending = true
    wrapper.vm.onCancel()
    expect(wrapper.vm.confirmationPending).toBe(false)
  })

  it(`should show notification for successful send`, async () => {
    wrapper.setData({
      fields: {
        denom: `mycoin`,
        address,
        amount: 2,
        password: `1234567890`
      }
    })
    await wrapper.vm.onApproved()
    // walletSend is async so we need to wait until it is resolved
    expect($store.commit).toHaveBeenCalledWith(`notify`, expect.any(Object))
  })

  it(`should show notification for unsuccessful send`, async () => {
    wrapper.setData({
      fields: {
        denom: `notmycoin`,
        address,
        amount: 2,
        password: `1234567890`
      }
    })
    wrapper.setMethods({
      sendTx: () => Promise.reject(new Error(`Error`))
    })
    await wrapper.vm.onApproved()
    expect($store.commit).toHaveBeenCalledWith(`notifyError`, {
      title: `Error Sending transaction`,
      body: expect.stringContaining(`Error`)
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

  it(`disables sending if not connected`, async () => {
    $store = {
      commit: jest.fn(),
      dispatch: jest.fn(),
      getters: Object.assign({}, getters, {
        connected: true
      })
    }

    wrapper = shallowMount(PageSend, {
      localVue,
      propsData: {
        denom: `mycoin`
      },
      mocks: {
        $store
      }
    })
    wrapper.setData({
      fields: {
        denom: `mycoin`,
        address,
        amount: 2,
        password: `1234567890`
      }
    })

    await wrapper.vm.$nextTick()
    expect(wrapper.find(`#send-btn`).exists()).toBe(true)

    $store = {
      commit: jest.fn(),
      dispatch: jest.fn(),
      getters: Object.assign({}, getters, {
        connected: false
      })
    }

    wrapper = shallowMount(PageSend, {
      localVue,
      propsData: {
        denom: `mycoin`
      },
      mocks: {
        $store
      }
    })
    wrapper.setData({
      fields: {
        denom: `mycoin`,
        address,
        amount: 2,
        password: `1234567890`
      }
    })

    await wrapper.vm.$nextTick()
    expect(wrapper.find(`#send-btn`).exists()).toBe(false)
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  describe(`default values are set correctly`, () => {
    it(`the 'amount' defaults to 0`, () => {
      expect(wrapper.vm.fields.amount).toEqual(0)
    })

    it(`account password defaults to an empty string`, () => {
      expect(wrapper.vm.fields.password).toEqual(``)
    })

    it(`password is hidden by default`, () => {
      expect(wrapper.vm.showPassword).toBe(false)
    })
  })

  describe(`Password display`, () => {
    it(`toggles the password between text and password`, () => {
      wrapper.vm.togglePassword()
      expect(wrapper.vm.showPassword).toBe(true)
      wrapper.vm.togglePassword()
      expect(wrapper.vm.showPassword).toBe(false)
    })
  })
})
