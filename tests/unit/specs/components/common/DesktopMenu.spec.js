import { shallowMount } from "@vue/test-utils"
import DesktopMenu from "common/DesktopMenu"

describe(`DesktopMenu`, () => {
  let wrapper

  beforeEach(async () => {
    wrapper = shallowMount(DesktopMenu, {
      props: {
        links: [
          {
            icon: "account_balance_wallet",
            route: "/portfolio",
            title: "Portfolio"
          },
          {
            icon: "add_box",
            route: "/validators",
            title: "Validators"
          }
        ],
        totalTokens: "1000",
        liquidTokens: "100",
        bondDenom: "stake",
        signedIn: true
      },
      stubs: [
        `router-link`,
        `v-divider`,
        `v-navigation-drawer`,
        `v-list`,
        `v-list-item`,
        `v-list-item-title`,
        `v-list-item-subtitle`,
        `v-list-item-content`,
        `v-list-item-avatar`,
        `v-icon`,
        `v-list-item-icon`
      ]
    })
  })

  it("should show a desktop menu", () => {
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`signals sign in`, () => {
    const self = { $emit: jest.fn() }
    DesktopMenu.methods.signIn.call(self)
    expect(self.$emit).toHaveBeenCalledWith(`signIn`)
  })

  it(`signals sign out`, () => {
    const self = { $emit: jest.fn() }
    DesktopMenu.methods.signOut.call(self)
    expect(self.$emit).toHaveBeenCalledWith(`signOut`)
  })
})
