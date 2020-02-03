import { shallowMount, createLocalVue } from "@vue/test-utils"
import Vuelidate from "vuelidate"
import TmSessionSignIn from "common/TmSessionSignIn"

describe(`TmSessionSignIn`, () => {
  const localVue = createLocalVue()
  localVue.use(Vuelidate)

  let wrapper, $store
  const addressPrefixes = [
    {
      id: "cosmos-hub-testnet",
      address_prefix: "cosmos",
      testnet: true
    },
    {
      id: "cosmos-hub-mainnet",
      address_prefix: "cosmos",
      testnet: false
    },
    {
      id: "terra-testnet",
      address_prefix: "terra",
      testnet: true
    }
  ]
  const addresses = [
    `cosmos15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9`,
    `cosmos1pxdf0lvq5jvl9uxznklgc5gxuwzpdy5ynem546`
  ]

  beforeEach(() => {
    $store = {
      commit: jest.fn(),
      dispatch: jest.fn(() => true),
      state: {
        keys: [
          {
            name: `cosmosdefault`,
            password: `1234567890`,
            address: addresses[0]
          },
          {
            name: `terradefault`,
            password: `1234567890`,
            address: addresses[0]
          }
        ],
        session: {
          address: ``,
          addresses: [
            {
              address: `cosmos1z8mzakma7vnaajysmtkwt4wgjqr2m84tzvyfkz`,
              type: `explore`
            },
            {
              address: `cosmos1unc788q8md2jymsns24eyhua58palg5kc7cstv`,
              type: `ledger`
            },
            {
              address: `cosmos1vxkye0mpdtjhzrc6va5lcnxnuaa7m64khj8klc`,
              type: `extension`
            },
            {
              address: `cosmos1vxkye0mpdtjhzrc6va5lcnxnuaa7m64khj8xyz`,
              type: `local`
            }
          ]
        },
        keystore: {
          accounts: [
            {
              address: `cosmos1234`,
              name: `my_account`
            }
          ]
        }
      }
    }

    wrapper = shallowMount(TmSessionSignIn, {
      localVue,
      mocks: {
        $router: {
          push: jest.fn()
        },
        $store
      }
    })

    wrapper.setData({ addressPrefixes })
  })

  it(`has the expected html structure`, () => {
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`should close the modal on successful login`, async () => {
    wrapper.setData({
      signInPassword: `1234567890`,
      signInAddress: `cosmosdefault`
    })
    wrapper.vm.$emit = jest.fn()
    await wrapper.vm.onSubmit()
    expect(wrapper.vm.$router.push).toHaveBeenCalledWith(`/`)
  })

  it(`should signal signedin state on successful login`, async () => {
    wrapper.setData({
      signInPassword: `1234567890`,
      signInAddress: `cosmosdefault`
    })
    await wrapper.vm.onSubmit()
    expect($store.dispatch).toHaveBeenCalledWith(`signIn`, {
      password: `1234567890`,
      address: "cosmosdefault",
      sessionType: `local`
    })
  })

  it(`should show error if password not 10 long`, () => {
    wrapper.setData({ signInPassword: `123` })
    wrapper.vm.onSubmit()
    expect($store.commit.mock.calls[1]).toBeUndefined()
    expect(wrapper.find(`.tm-form-msg-error`)).toBeDefined()
  })

  it(`should show a notification if signin failed`, async () => {
    $store.dispatch = jest.fn().mockResolvedValueOnce(false)
    wrapper.setData({
      signInPassword: `1234567889`,
      signInAddress: `cosmosdefault`
    })
    await wrapper.vm.onSubmit()
    expect(wrapper.vm.error).toBe(`The provided username or password is wrong.`)
  })

  it(`should show the only account that exists`, () => {
    const self = {
      accounts: [
        {
          value: `default`
        }
      ],
      $el: {
        querySelector: jest.fn(() => ({
          focus: jest.fn()
        }))
      }
    }
    TmSessionSignIn.methods.setDefaultAccount.call(self)

    expect(self.signInAddress).toBe(`default`)
    expect(self.$el.querySelector).toHaveBeenCalledWith(`#sign-in-password`)
  })

  it(`should show the last account used`, () => {
    localStorage.setItem(`prevAccountKey`, `lastUsed`)

    const self = {
      accounts: [
        {
          value: `default`
        },
        {
          value: `lastUsed`
        }
      ],
      $el: {
        querySelector: jest.fn(() => ({
          focus: jest.fn()
        }))
      }
    }
    TmSessionSignIn.methods.setDefaultAccount.call(self)

    expect(self.signInAddress).toBe(`lastUsed`)
    expect(self.$el.querySelector).toHaveBeenCalledWith(`#sign-in-password`)
  })

  it(`should focus on the name input when there are no accounts`, () => {
    const self = {
      accounts: [],
      $el: {
        querySelector: jest.fn(() => ({
          focus: jest.fn()
        }))
      }
    }
    TmSessionSignIn.methods.setDefaultAccount.call(self)

    expect(self.signInAddress).toBe(undefined)
    expect(self.$el.querySelector).toHaveBeenCalledWith(`#sign-in-name`)
  })

  it(`automatically connects to the network an address belongs to`, async () => {
    await wrapper.vm.selectNetworkByAddress(`terradefault`)
    expect($store.dispatch).toHaveBeenCalledWith(`setNetwork`, {
      id: "terra-testnet",
      address_prefix: "terra",
      testnet: true
    })
  })

  it(`automatically connects to the testnet network an address belongs to if "tesnet" is set to true`, async () => {
    wrapper.setData({
      testnet: true
    })
    await wrapper.vm.selectNetworkByAddress(`cosmosdefault`)
    expect($store.dispatch).toHaveBeenCalledWith(`setNetwork`, {
      id: "cosmos-hub-testnet",
      address_prefix: "cosmos",
      testnet: true
    })
  })
})
