import { shallowMount } from "@vue/test-utils"
import Menu from "common/Menu"

describe(`Menu`, () => {
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

    wrapper = shallowMount(Menu, {
      mocks: {
        $store
      }
    })
  })

  it("should show a the menus for mobile and desktop", () => {
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`totalAtoms`, () => {
    const result = Menu.computed.totalAtoms.call({
      liquidAtoms: 2,
      bondedAtoms: `42`,
      unbondingAtoms: 9
    })

    expect(result).toBe(`53`)
  })

  it(`bondedAtoms`, () => {
    const result = Menu.computed.bondedAtoms.call({
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
    const result = Menu.computed.unbondingAtoms.call({
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

  it(`opens the session modal for a sign in`, () => {
    const $store = { commit: jest.fn(), $emit: jest.fn() }
    const self = { $store, $router: { push: jest.fn() }, $emit: jest.fn() }
    Menu.methods.signIn.call(self)
    expect(self.$router.push).toHaveBeenCalledWith(`/welcome`)
  })

  it(`call dispatch to sign the user out`, () => {
    const $store = { dispatch: jest.fn() }
    const self = { $store, $router: { push: jest.fn() }, $emit: jest.fn() }
    Menu.methods.signOut.call(self)
    expect($store.dispatch).toHaveBeenCalledWith(`signOut`)
  })
})
