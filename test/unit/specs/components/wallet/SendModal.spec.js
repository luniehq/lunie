import setup from "../../../helpers/vuex-setup"
import SendModal from "renderer/components/wallet/SendModal"
import lcdClientMock from "renderer/connectors/lcdClientMock.js"

describe(`SendModal`, () => {
  let wrapper, store
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

  it(`should show address required error`, async () => {
    let { wrapper, store } = mount(SendModal, {
      propsData: {
        denom: `fermion`
      },
      sync: false
    })
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
    wrapper.vm.validateForm()
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
    wrapper.vm.validateForm()
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
    wrapper.vm.validateForm()
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.$el).toMatchSnapshot()
  })
  it(`should show bech32 error when alphanumeric is wrong`, async () => {
    wrapper.vm.validateForm()
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  // it(`should trigger confirmation modal if form is correct`, async () => {
  //   wrapper.setData({
  //     fields: {
  //       denom: `STAKE`,
  //       address,
  //       amount: 2,
  //       password: `1234567890`
  //     }
  //   })
  //   wrapper.vm.validateForm()
  //   await wrapper.vm.$nextTick()
  //   expect(wrapper.vm.$v.$error).toBe(false)
  //   expect(wrapper.vm.confirmationPending).toBe(true)
  //   expect(wrapper.vm.$el).toMatchSnapshot()
  // })

  // it(`should close confirmation modal on cancel`, async () => {
  //   wrapper.vm.confirmationPending = true
  //   wrapper.vm.onCancel()
  //   expect(wrapper.vm.confirmationPending).toBe(false)
  // })

  it(`should show notification for successful send`, async () => {
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
      sendTx: () => Promise.resolve(),
      resetForm: jest.fn(),
      $refs: {
        actionModal: {
          submit: cb => cb()
        }
      }
    }
    await SendModal.methods.submitForm.call(self)

    expect($store.commit).toHaveBeenCalledWith(`notify`, expect.any(Object))
    expect(self.submissionError).toBeFalsy()
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
})
