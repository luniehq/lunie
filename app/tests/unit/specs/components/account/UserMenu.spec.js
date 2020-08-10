import { shallowMount, createLocalVue } from "@vue/test-utils"
import UserMenu from "src/components/account/UserMenu"

const localVue = createLocalVue()
localVue.directive(`close-popover`, () => {})

describe(`UserMenu`, () => {
  let wrapper, $store

  beforeEach(() => {
    $store = {
      dispatch: jest.fn(),
      getters: {
        network: `cosmos-hub-mainnet`,
        address: `cosmos1234`,
        networks: [
          { id: `cosmos-hub-mainnet` },
          { id: `terra-mainnet` },
          { id: `polkadot` },
        ],
      },
      state: {
        session: {
          experimentalMode: false,
          allSessionAddresses: [
            {
              address: `cosmos1234`,
              networkId: `cosmos-hub-mainnet`,
            },
            {
              address: `terra1234`,
              networkId: `terra-mainnet`,
            },
            {
              address: `1234`,
              networkId: `polkadot`,
            },
          ],
        },
        account: {
          userSignedIn: true,
          user: {
            email: `email@.mail.com`,
          },
        },
        keystore: {
          accounts: [
            {
              address: `cosmos5467`,
              networkId: `cosmos-hub-mainnet`,
            },
            {
              address: `terra5467`,
              networkId: `terra-mainnet`,
            },
            {
              address: `5467`,
              networkId: `polkadot`,
            },
          ],
        },
        extension: {
          accounts: [],
        },
      },
    }
    wrapper = shallowMount(UserMenu, {
      localVue,
      mocks: {
        $store,
      },
      stubs: [`router-link`],
    })
  })

  // skipping due to missing v-popover component and close-popover directive
  it.skip(`should show the UserMenu page`, async () => {
    expect(wrapper.element).toMatchSnapshot()
  })
})
