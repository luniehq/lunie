import { shallowMount } from "@vue/test-utils"
import AccountList from "common/AccountList"

describe(`AccountList`, () => {
  let wrapper

  beforeEach(() => {
    wrapper = shallowMount(AccountList, {
      propsData: {
        accounts: [
          {
            name: "Benjis account",
            address: "cosmos1ek9cd8ewgxg9w5xllq9um0uf4aaxaruvcw4v9e"
          },
          {
            name: "Colins account",
            address: "cosmos1ek9cd8ewgxgyoyocolinyo4aaxaruvcw4v9e"
          }
        ]
      }
    })
  })

  it(`has the expected html structure`, () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`renders the correct accounts`, () => {
    expect(wrapper.html()).toContain("Benjis account")
    expect(wrapper.html()).toContain("Colins account")
  })
})
