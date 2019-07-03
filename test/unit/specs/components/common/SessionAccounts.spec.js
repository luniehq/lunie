import { createLocalVue, shallowMount } from "@vue/test-utils"
import Vuelidate from "vuelidate"
import SessionAccounts from "common/SessionAccounts"

describe(`SessionAccounts`, () => {
  const localVue = createLocalVue()
  localVue.use(Vuelidate)

  let wrapper, $store

  beforeEach(() => {
    $store = {
      state: {
        accounts: [
          {
            name: "accountName",
            address: "cosmos1ek9cd8ewgxg9w5xllq9um0uf4aaxaruvcw4v9e"
          }
        ]
      }
    }
    wrapper = shallowMount(SessionAccounts, {
      localVue,
      stubs: [`router-link`],
      mocks: {
        $store
      }
    })
  })

  it(`has the expected html structure`, () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`renders the correct account`, () => {
    expect(wrapper.html()).toContain("<h3>accountName</h3>")
  })

  it(`should show an account`, () => {
    expect(wrapper.find(`.card-content`)).toBeDefined()
  })
})
