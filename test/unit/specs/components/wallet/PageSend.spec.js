import setup from "../../../helpers/vuex-setup"
import PageSend from "renderer/components/wallet/PageSend"

describe(`PageSend`, () => {
  let wrapper, store, node
  const name = `default`
  const password = `1234567890`
  const address = `tb1mjt6dcdru8lgdz64h2fu0lrzvd5zv8sfcvkv2l`

  const coins = [
    {
      denom: `mycoin`,
      amount: 1000
    },
    {
      denom: `fermion`,
      amount: 2300
    }
  ]

  let { mount } = setup()

  beforeEach(async () => {
    let test = mount(PageSend, {
      propsData: {
        denom: `fermion`
      },
      sync: false
    })
    wrapper = test.wrapper
    store = test.store
    node = test.node
    store.commit(`setAccounts`, [
      {
        address,
        name,
        password
      }
    ])
    store.commit(`setConnected`, true)
    await store.dispatch(`signIn`, {
      account: name,
      password
    })
    store.commit(`setWalletBalances`, coins)
    store.commit(`setNonce`, `1`)
  })

  it(`has the expected html structure`, async () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`should populate the select options with denoms`, () => {
    expect(
      wrapper
        .findAll(`option`)
        .at(0)
        .text()
    ).toBe(`Select token...`)
    expect(
      wrapper
        .findAll(`option`)
        .at(1)
        .text()
    ).toBe(coins[0].denom.toUpperCase())
    expect(
      wrapper
        .findAll(`option`)
        .at(2)
        .text()
    ).toBe(coins[1].denom.toUpperCase())
  })

  it(`should work without providing a default denom`, async () => {
    let { wrapper, store } = mount(PageSend, {
      sync: false
    })
    store.commit(`setConnected`, true)
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`should show address required error`, async () => {
    let { wrapper, store } = mount(PageSend, { sync: false })
    store.commit(`setConnected`, true)
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
    store.commit(`setConnected`, true)
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
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`should show bech32 error when address length is too long`, async () => {
    store.commit(`setConnected`, true)
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
    expect(wrapper.vm.$el).toMatchSnapshot()
  })
  it(`should show bech32 error when alphanumeric is wrong`, async () => {
    store.commit(`setConnected`, true)
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
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`should trigger confirmation modal if form is correct`, async () => {
    store.commit(`setConnected`, true)
    store.commit(`setWalletBalances`, coins)
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
    expect(wrapper.vm.confirmationPending).toBe(true)
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`should close confirmation modal on cancel`, async () => {
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
    expect(store.commit).toHaveBeenCalledWith(`notify`, expect.any(Object))
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
    node.sign = () => Promise.reject()
    await wrapper.vm.onApproved()
    expect(store.state.notifications.length).toBe(1)
    expect(store.state.notifications[0].title).toBe(`Error Sending transaction`)
    expect(store.state.notifications[0]).toMatchSnapshot()
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
    store.commit(`setConnected`, false)
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
