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

    wrapper.vm.$refs.actionModal.open()
  })

  it(`has the expected html structure`, async () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  describe(`validation`, () => {
    it(`should show address required error`, async () => {
      let { wrapper, store } = mount(SendModal, {
        propsData: {
          denom: `fermion`
        },
        sync: false
      })
      wrapper.vm.$refs.actionModal.open()
      store.commit(`setConnected`, true)
      store.commit(`setStakingParameters`, stakingParameters.parameters)
      wrapper.setData({
        denom: stakingParameters.parameters.bond_denom,
        address: ``,
        amount: 2
      })
      expect(await wrapper.vm.validateForm()).toBe(false)
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.$v.$error).toBe(true)
      expect(wrapper.vm.$el).toMatchSnapshot()
    })
    it(`should show bech32 error when address length is too short`, async () => {
      store.commit(`setConnected`, true)
      store.commit(`setStakingParameters`, stakingParameters.parameters)
      wrapper.setData({
        denom: stakingParameters.parameters.bond_denom,
        address: `asdf`,
        amount: 2
      })
      expect(await wrapper.vm.validateForm()).toBe(false)
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.$el).toMatchSnapshot()
    })

    it(`should show bech32 error when address length is too long`, async () => {
      store.commit(`setConnected`, true)
      store.commit(`setStakingParameters`, stakingParameters.parameters)
      wrapper.setData({
        denom: stakingParameters.parameters.bond_denom,
        address: `asdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdf`,
        amount: 2
      })
      expect(await wrapper.vm.validateForm()).toBe(false)
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.$el).toMatchSnapshot()
    })
    it(`should show bech32 error when alphanumeric is wrong`, async () => {
      expect(await wrapper.vm.validateForm()).toBe(false)
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.$el).toMatchSnapshot()
    })
  })

  it(`should show notification for successful send`, async () => {
    let $store = {
      commit: jest.fn(),
      dispatch: jest.fn()
    }

    let self = {
      denom: `notmycoin`,
      address,
      amount: 2,
      $store,
      sendTx: () => Promise.resolve(),
      $refs: {
        actionModal: {
          submit: cb => cb()
        }
      }
    }
    await SendModal.methods.submitForm.call(self, `local`, password)

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
})
