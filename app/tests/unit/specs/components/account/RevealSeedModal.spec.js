import { shallowMount, createLocalVue } from "@vue/test-utils"
import Vuelidate from "vuelidate"
import RevealSeedModal from "src/components/account/RevealSeedModal"

const localVue = createLocalVue()
localVue.use(Vuelidate)

jest.mock(`src/../config.js`, () => ({
  isExtension: false,
}))

const $route = {
  params: {
    address: `cosmos1234`,
  },
}

describe(`RevealSeedModal`, () => {
  let wrapper

  beforeEach(() => {
    ;(wrapper = shallowMount(RevealSeedModal)),
      {
        localVue,
        mocks: {
          $route,
        },
      }
  })

  //   it(`should show the RevealSeedModal page`, async () => {
  //     expect(wrapper.element).toMatchSnapshot()
  //   })

  //   it(`should return the wallet secret, whether a seed or a private key`, async () => {
  //         let self = {
  //             $route,
  //             wallet: {
  //                 seedPhrase: `abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon art`
  //             }
  //         }
  //         let secret = RevealSeedModal.computed.seedOrPrivateKey.call(self)
  //         expect(secret).toBe(`abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon art`)
  //         self = {
  //             $route,
  //             wallet: {
  //                 privateKey: `0123456789`
  //             }
  //         }
  //         secret = RevealSeedModal.computed.seedOrPrivateKey.call(self)
  //         expect(secret).toBe(`0123456789`)
  //         self = {
  //             $route,
  //             wallet: {}
  //         }
  //         secret = RevealSeedModal.computed.seedOrPrivateKey.call(self)
  //         expect(secret).toBe(``)
  //   })
})
