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
        ]
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

  it("should show a mobile menu", () => {
    expect(wrapper.element).toMatchSnapshot()
  })
})
