import { shallowMount } from "@vue/test-utils"
import DesktopMenu from "common/DesktopMenu"

describe(`DesktopMenu`, () => {
  let wrapper, $store

  beforeEach(async () => {
    $store = {
      commit: jest.fn(),
      getters: {
        session: {
          signedIn: true
        },
        liquidAtoms: 1000,
        bondDenom: "stake",
        committedDelegations: {
          validator1: 42,
          validator2: 9
        },
        delegation: {
          unbondingDelegations: {
            validator1: [
              {
                balance: `42`
              }
            ],
            validator2: [
              {
                balance: `9`
              },
              {
                balance: `12`
              }
            ]
          }
        },
        delegates: {
          delegates: [
            {
              operator_address: `validator1`,
              delegator_shares: `1000`,
              tokens: `1000`
            },
            {
              operator_address: `validator2`,
              delegator_shares: `1000`,
              tokens: `100`
            }
          ]
        }
      }
    }

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
        ]
      },
      mocks: {
        $store
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

  it(`opens the session modal for a sign in`, () => {
    const $store = { commit: jest.fn(), $emit: jest.fn() }
    const self = { $store, $router: { push: jest.fn() }, $emit: jest.fn() }
    DesktopMenu.methods.signIn.call(self)
    expect(self.$router.push).toHaveBeenCalledWith(`/welcome`)
  })

  it(`call dispatch to sign the user out`, () => {
    const $store = { dispatch: jest.fn() }
    const self = { $store, $router: { push: jest.fn() }, $emit: jest.fn() }
    DesktopMenu.methods.signOut.call(self)
    expect($store.dispatch).toHaveBeenCalledWith(`signOut`)
  })

  it(`totalAtoms`, () => {
    const result = DesktopMenu.computed.totalAtoms.call({
      liquidAtoms: 2,
      bondedAtoms: `42`,
      unbondingAtoms: 9
    })

    expect(result).toBe(`53`)
  })

  it(`bondedAtoms`, () => {
    const result = DesktopMenu.computed.bondedAtoms.call({
      committedDelegations: {
        validator1: 42,
        validator2: 9
      },
      delegates: {
        delegates: [
          {
            operator_address: `validator1`,
            delegator_shares: `1000`,
            tokens: `1000`
          },
          {
            operator_address: `validator2`,
            delegator_shares: `1000`,
            tokens: `100`
          }
        ]
      }
    })

    expect(result.toNumber()).toBe(42.9)
  })

  it(`unbondingAtoms`, () => {
    const result = DesktopMenu.computed.unbondingAtoms.call({
      delegation: {
        unbondingDelegations: {
          validator1: [
            {
              balance: `42`
            }
          ],
          validator2: [
            {
              balance: `9`
            },
            {
              balance: `12`
            }
          ]
        }
      }
    })

    expect(result.toNumber()).toBe(63)
  })
})
