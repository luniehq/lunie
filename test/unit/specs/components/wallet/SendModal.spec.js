import setup from "../../../helpers/vuex-setup"
import SendModal from "renderer/components/wallet/SendModal"

describe(`SendModal`, () => {
  let wrapper, store, node
  const name = `default`
  const password = `1234567890`
  const address = `tb1mjt6dcdru8lgdz64h2fu0lrzvd5zv8sfcvkv2l`
  let { stakingParameters } = lcdClientMock.state

  const coins = [
    {
      denom: stakingParameters.parameters.bond_denom,
      amount: 1000
    },
    {
      denom: `fermion`,
      amount: 2300
    }
  ]

  let { mount } = setup()

  beforeEach(async () => {
    let instance = mount(SendModal, {
      propsData: {
        denom: `fermion`
      },
      sync: false
    })
    wrapper = instance.wrapper
    store = instance.store
    await store.dispatch(`signIn`, {
      account: name,
      password
    })
    store.commit(`setAccounts`, [
      {
        address,
        name,
        password
      }
    ])
    store.commit(`setConnected`, true)
    store.commit(`setWalletBalances`, coins)
    store.commit(`setAtoms`, 1000)
    store.commit(`setStakingParameters`, stakingParameters.parameters)
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
    let { wrapper, store } = mount(SendModal, {
      sync: false
    })
    store.commit(`setConnected`, true)
    store.commit(`setStakingParameters`, stakingParameters.parameters)
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`should show address required error`, async () => {
    let { wrapper, store } = mount(SendModal, { sync: false })
    store.commit(`setConnected`, true)
    store.commit(`setStakingParameters`, stakingParameters.parameters)
    wrapper.setData({
      fields: {
        denom: stakingParameters.parameters.bond_denom,
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
    store.commit(`setStakingParameters`, stakingParameters.parameters)
    wrapper.setData({
      fields: {
        denom: stakingParameters.parameters.bond_denom,
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
    store.commit(`setStakingParameters`, stakingParameters.parameters)
    wrapper.setData({
      fields: {
        denom: stakingParameters.parameters.bond_denom,
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
    store.commit(`setStakingParameters`, stakingParameters.parameters)
    wrapper.setData({
      fields: {
        denom: stakingParameters.parameters.bond_denom,
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
    store.commit(`setStakingParameters`, stakingParameters.parameters)
    store.commit(`setConnected`, true)
    store.commit(`setWalletBalances`, coins)
    wrapper.setData({
      fields: {
        denom: stakingParameters.parameters.bond_denom,
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

  it(`should show notification for successful send`, async () => {
    wrapper.setData({
      fields: {
        denom: stakingParameters.parameters.bond_denom,
        address,
        amount: 2,
        password: `1234567890`
      }
    })
    // walletSend is async so we need to wait until it is resolved
    expect(store.commit).toHaveBeenCalledWith(`notify`, expect.any(Object))
  })

  it(`should show notification for unsuccessful send`, async () => {
    let $store = {
      commit: jest.fn(),
      dispatch: jest.fn()
    }

    let self = {
      fields: {
        denom: `notmycoin`,
        address,
        amount: 2,
        password: `1234567890`
      },
      $store,
      methods: {
        sendTx: () => Promise.reject()
      }
    }
    PageSend.methods.onApproved.call(self)

    expect($store.commit).toHaveBeenCalledWith(`notifyError`, {
      title: `Error Sending transaction`,
      body: expect.stringContaining(``)
    })
    node.sign = () => Promise.reject()
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
    store.commit(`setStakingParameters`, stakingParameters.parameters)
    wrapper.setData({
      fields: {
        denom: stakingParameters.parameters.bond_denom,
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
})
