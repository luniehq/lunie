import { shallowMount } from "@vue/test-utils"
import AccountList from "src/components/account/AccountList"

describe(`AccountList`, () => {
  let wrapper

  beforeEach(() => {
    wrapper = shallowMount(AccountList, {
      propsData: {
        accounts: [
          {
            name: "account1",
            address: "cosmos123",
          },
          {
            name: "account2",
            address: "cosmos456",
          },
        ],
        buttonAction: jest.fn(),
        buttonText: "Text",
      },
    })
  })

  it(`should show the AccountList page`, async () => {
    expect(wrapper.element).toMatchSnapshot()
  })
})
