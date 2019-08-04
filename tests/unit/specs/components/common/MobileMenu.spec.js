import { shallowMount } from "@vue/test-utils"
import MobileMenu from "common/MobileMenu"

describe(`MobileMenu`, () => {
  let wrapper

  beforeEach(() => {
    wrapper = shallowMount(MobileMenu, {
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
        `v-footer`,
        `v-divider`,
        `v-card`,
        `v-card-text`,
        `v-navigation-drawer`,
        `v-list`,
        `v-list-item`,
        `v-list-item-title`,
        `v-list-item-subtitle`,
        `v-list-item-content`,
        `v-list-item-avatar`,
        `v-icon`,
        `v-list-item-icon`,
        `v-spacer`,
        `v-app-bar`,
        `v-btn`
      ]
    })
  })

  it("should show a mobile menu", () => {
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`signals sign in`, () => {
    const self = { $emit: jest.fn() }
    MobileMenu.methods.signIn.call(self)
    expect(self.$emit).toHaveBeenCalledWith(`signIn`)
  })

  it(`signals sign out`, () => {
    const self = { $emit: jest.fn() }
    MobileMenu.methods.signOut.call(self)
    expect(self.$emit).toHaveBeenCalledWith(`signOut`)
  })
})
