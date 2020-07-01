import { shallowMount, createLocalVue } from "@vue/test-utils"
import Vuelidate from "vuelidate"
import VueClipboard from "vue-clipboard2"
import RevealSeedModal from "src/components/account/RevealSeedModal"

const localVue = createLocalVue()
localVue.use(Vuelidate)
localVue.directive(`clipboard`, VueClipboard)

jest.mock(`src/../config.js`, () => ({
  isExtension: false,
}))

const $route = {
  params: {
    address: `cosmos1234`,
  },
}

describe(`RevealSeedModal`, () => {
  let wrapper, $store

  beforeEach(() => {
    $store = {
      dispatch: async () => {
        return { seedPhrase: `seed1 seed2 seed3` }
      },
    }
    wrapper = shallowMount(RevealSeedModal, {
      localVue,
      mocks: {
        $route,
        $store,
      },
    })
  })

  it(`should show the RevealSeedModal page`, async () => {
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`should return the wallet secret, whether a seed or a private key`, async () => {
    let self = {
      $route,
      wallet: {
        seedPhrase: `abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon art`,
      },
    }
    let secret = RevealSeedModal.computed.seedOrPrivateKey.call(self)
    expect(secret).toBe(
      `abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon art`
    )
    self = {
      $route,
      wallet: {
        privateKey: `0123456789`,
      },
    }
    secret = RevealSeedModal.computed.seedOrPrivateKey.call(self)
    expect(secret).toBe(`0123456789`)
    self = {
      $route,
      wallet: {},
    }
    secret = RevealSeedModal.computed.seedOrPrivateKey.call(self)
    expect(secret).toBe(``)
  })

  it(`should set recoveryError to true when failing to fetch wallet from stored wallets`, async () => {
    $store = { dispatch: jest.fn() }
    wrapper = shallowMount(RevealSeedModal, {
      localVue,
      mocks: {
        $route,
        $store,
      },
    })
    wrapper.setData({
      password: `password`,
    })
    await wrapper.vm.revealSeedPhrase()
    expect(wrapper.vm.recoveryError).toBe(true)
  })

  it(`should get the wallet and set it in data if it contains the secret (seed or private key)`, async () => {
    wrapper.setData({
      password: `password`,
    })
    await wrapper.vm.revealSeedPhrase()
    expect(wrapper.vm.wallet).toEqual({ seedPhrase: `seed1 seed2 seed3` })
  })

  it(`should set input type for password input as "text" or as "password" if it is already "text".
        It should also increase by one this component key`, () => {
    wrapper.setData({
      passwordInputType: `text`,
      passwordInputKey: 0,
    })
    wrapper.vm.showPassword()
    expect(wrapper.vm.passwordInputType).toBe(`password`)
    expect(wrapper.vm.passwordInputKey).toBe(1)

    wrapper.setData({
      passwordInputType: `hey`,
    })
    wrapper.vm.showPassword()
    expect(wrapper.vm.passwordInputType).toBe(`text`)
    expect(wrapper.vm.passwordInputKey).toBe(2)
  })
})
