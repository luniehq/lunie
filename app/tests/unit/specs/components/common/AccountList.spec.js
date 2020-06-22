import { shallowMount } from "@vue/test-utils"
import AccountList from "account/AccountList"

describe(`AccountList`, () => {
  let wrapper, $store

  $store = {
    dispatch: jest.fn(),
  }

  beforeEach(() => {
    wrapper = shallowMount(AccountList, {
      mocks: {
        $store,
        $router: {
          push: jest.fn(),
        },
      },
      propsData: {
        accounts: [
          {
            name: "Benjis account",
            address: "cosmos1ek9cd8ewgxg9w5xllq9um0uf4aaxaruvcw4v9e",
          },
          {
            name: "Colins account",
            address: "cosmos1ek9cd8ewgxgyoyocolinyo4aaxaruvcw4v9e",
          },
        ],
        buttonAction: jest.fn(),
        buttonText: `Button Text`,
      },
    })
  })

  it(`has the expected html structure`, () => {
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`renders the correct accounts`, () => {
    expect(wrapper.html()).toContain("Benjis account")
    expect(wrapper.html()).toContain("Colins account")
  })
})
