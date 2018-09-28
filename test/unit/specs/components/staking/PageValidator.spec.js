import Delegation from "renderer/vuex/modules/delegation"
import ModalStake from "staking/ModalStake"
import ModalUnstake from "staking/ModalUnstake"
import setup from "../../../helpers/vuex-setup"
import PageValidator from "renderer/components/staking/PageValidator"
import { createLocalVue, mount } from "@vue/test-utils"
import Vuelidate from "vuelidate"

const delegate = {
  owner: `1a2b3c`,
  pub_key: {
    type: `AC26791624DE60`,
    data: `dlN5SLqeT3LT9WsUK5iuVq1eLQV2Q1JQAuyN0VwSWK0=`
  },
  tokens: `19`,
  delegator_shares: `19`,
  description: {
    details: `Herr Schmidt`,
    website: `www.schmidt.de`,
    moniker: `herr_schmidt_revoked`,
    country: `DE`
  },
  revoked: false,
  status: 2,
  bond_height: `0`,
  bond_intra_tx_counter: 6,
  proposer_reward_pool: null,
  commission: `0.05`,
  commission_max: `0.1`,
  commission_change_rate: `0.01`,
  commission_change_today: `0.005`,
  prev_bonded_shares: `0`,
  voting_power: `10`
}

const getterValues = {
  bondingDenom: `atom`,
  config: {
    bondingDenom: `atom`,
    desktop: false
  },
  delegates: {
    delegates: [delegate],
    globalPower: 4200
  },
  delegation: {
    committedDelegates: { "1a2b3c": 0 },
    unbondingDelegations: {}
  },
  keybase: `keybase`,
  oldBondedAtoms: 50,
  totalAtoms: 100,
  user: { atoms: 42 },
  wallet: { address: `cosmosaccaddr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9` }
}

describe(`PageValidator`, () => {
  let wrapper, store
  let { mount } = setup()

  beforeEach(() => {
    let instance = mount(PageValidator, {
      doBefore: ({ router, store }) => {
        router.push(`/staking/validators/1a2b3c`)
        store.commit(`setDelegates`, [delegate])
      }
    })
    wrapper = instance.wrapper
    store = instance.store
  })

  it(`has the expected html structure`, async () => {
    // after importing the @tendermint/ui components from modules
    // the perfect scroll plugin needs a $nextTick and a wrapper.update
    // to work properly in the tests (snapshots weren't matching)
    // this has occured across multiple tests
    await wrapper.vm.$nextTick()
    wrapper.update()
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`should return one delegate based on route params`, () => {
    expect(wrapper.vm.validator.owner).toEqual(`1a2b3c`)
  })

  it(`shows a default avatar`, () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`shows an error if the validator couldn't be found`, () => {
    let instance = mount(PageValidator, {
      doBefore: ({ router }) => {
        router.push(`/staking/validators/1a2b3c`)
      },
      getters: {
        config: () => ({ desktop: false }),
        delegates: () => ({
          delegates: []
        })
      }
    })

    wrapper = instance.wrapper

    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`shows the selfBond`, async () => {
    await store.commit(`setSelfBond`, {
      validator: {
        owner: `1a2b3c`,
        delegator_shares: `4242`
      },
      ratio: 0.01
    })
    wrapper.update()
    expect(wrapper.find(`#validator-profile__self-bond`).text()).toBe(`1.00 %`)
  })

  it(`should show the validator status`, () => {
    expect(wrapper.vm.status).toBe(`This validator is actively validating`)
    // Jailed
    store.state.delegates.delegates = [
      Object.assign({}, delegate, {
        revoked: true
      })
    ]
    wrapper.update()
    expect(wrapper.vm.status).toBe(
      `This validator has been jailed and is not currently validating`
    )
    // Is not a validator
    store.state.delegates.delegates = [
      Object.assign({}, delegate, {
        voting_power: 0
      })
    ]
    wrapper.update()
    expect(wrapper.vm.status).toBe(
      `This validator has declared candidacy but does not have enough voting power yet`
    )
  })

  // TODO enable when we decide on limits are defined
  // it("switches color indicators", async () => {
  //   store.state.delegates.delegates = [
  //     Object.assign({}, delegate, {
  //       commission: "0"
  //     })
  //   ]
  //   wrapper.update()
  //   expect(wrapper.find("#validator-profile__commission").classes()).toContain(
  //     "green"
  //   )
  //
  //   store.state.delegates.delegates = [
  //     Object.assign({}, delegate, {
  //       commission: "0.02"
  //     })
  //   ]
  //   wrapper.update()
  //   expect(wrapper.find("#validator-profile__commission").classes()).toContain(
  //     "yellow"
  //   )
  //
  //   store.state.delegates.delegates = [
  //     Object.assign({}, delegate, {
  //       commission: "1"
  //     })
  //   ]
  //   wrapper.update()
  //   expect(wrapper.find("#validator-profile__commission").classes()).toContain(
  //     "red"
  //   )
  //
  //   store.state.delegates.globalPower = 1000
  //   store.state.delegates.delegates = [
  //     Object.assign({}, delegate, {
  //       tokens: "1000"
  //     })
  //   ]
  //   wrapper.update()
  //   expect(wrapper.find("#validator-profile__power").classes()).toContain("red")
  //
  //   store.state.delegates.delegates = [
  //     Object.assign({}, delegate, {
  //       tokens: "10"
  //     })
  //   ]
  //   wrapper.update()
  //   expect(wrapper.find("#validator-profile__power").classes()).toContain(
  //     "yellow"
  //   )
  //
  //   store.state.delegates.delegates = [
  //     Object.assign({}, delegate, {
  //       tokens: "1"
  //     })
  //   ]
  //   wrapper.update()
  //   expect(wrapper.find("#validator-profile__power").classes()).toContain(
  //     "green"
  //   )
  // })

  it(`shows a validator as candidate if he has no voting_power`, () => {
    store.state.delegates.delegates = [
      Object.assign({}, delegate, {
        voting_power: `0`
      })
    ]
    wrapper.update()
    expect(wrapper.vm.status).toMatchSnapshot()
    // expect(wrapper.find(".validator-profile__status").classes()).toContain(
    //   "yellow"
    // )
  })

  it(`shows that a validator is revoked`, () => {
    store.state.delegates.delegates = [
      Object.assign({}, delegate, {
        revoked: true
      })
    ]
    wrapper.update()
    wrapper.vm.status = expect(wrapper.vm.status).toMatchSnapshot()
    // expect(wrapper.find(".validator-profile__status").classes()).toContain(
    //   "red"
    // )
  })
})

describe(`onStake`, () => {
  describe(`make sure we have enough atoms to stake`, () => {
    it(`is enough`, () => {
      const $store = {
        commit: jest.fn(),
        dispatch: jest.fn(),
        getters: getterValues
      }

      const wrapper = mount(PageValidator, {
        mocks: {
          $route: { params: { validator: `1a2b3c` } },
          $store
        }
      })

      wrapper.find(`#stake-btn`).trigger(`click`)
      expect(wrapper.contains(ModalStake)).toEqual(true)
    })

    it(`is not enough`, () => {
      const $store = {
        commit: jest.fn(),
        dispatch: jest.fn(),
        getters: Object.assign({}, getterValues, { oldBondedAtoms: 100 })
      }

      const wrapper = mount(PageValidator, {
        mocks: {
          $route: { params: { validator: `1a2b3c` } },
          $store
        }
      })

      wrapper.find(`#stake-btn`).trigger(`click`)

      expect(wrapper.text().includes(`You have no atoms to stake.`)).toEqual(
        true
      )

      wrapper.find(`#no-atoms-modal__btn`).trigger(`click`)

      expect(wrapper.text().includes(`You have no atoms to stake.`)).toEqual(
        false
      )
    })
  })

  describe(`submitDelegation`, () => {
    describe(`unit`, () => {
      it(`success`, async () => {
        const $store = {
          commit: jest.fn(),
          dispatch: jest.fn(),
          getters: getterValues
        }

        const {
          vm: { submitDelegation }
        } = mount(PageValidator, {
          mocks: {
            $route: { params: { validator: `1a2b3c` } },
            $store
          }
        })

        await submitDelegation({ amount: 10 })

        expect($store.dispatch.mock.calls).toEqual([
          [`submitDelegation`, { delegations: [{ atoms: 10, delegate }] }]
        ])

        expect($store.commit.mock.calls).toEqual([
          [
            `notify`,
            {
              body: `You have successfully staked your atoms.`,
              title: `Successful Staking!`
            }
          ]
        ])
      })

      it(`error`, async () => {
        const $store = {
          commit: jest.fn(),
          dispatch: jest.fn(() => {
            throw new Error(`message`)
          }),
          getters: getterValues
        }

        const {
          vm: { submitDelegation }
        } = mount(PageValidator, {
          mocks: {
            $route: { params: { validator: `1a2b3c` } },
            $store
          }
        })

        await submitDelegation({ amount: 10 })

        expect($store.dispatch.mock.calls).toEqual([
          [`submitDelegation`, { delegations: [{ atoms: 10, delegate }] }]
        ])

        expect($store.commit.mock.calls).toEqual([
          [
            `notifyError`,
            {
              body: `message`,
              title: `Error While Staking atoms`
            }
          ]
        ])
      })

      it(`error with data`, async () => {
        const $store = {
          commit: jest.fn(),
          dispatch: jest.fn(() => {
            throw new Error(`one\ntwo\nthree\nfour\nfive\nsix"seven`)
          }),
          getters: getterValues
        }

        const {
          vm: { submitDelegation }
        } = mount(PageValidator, {
          mocks: {
            $route: { params: { validator: `1a2b3c` } },
            $store
          }
        })

        await submitDelegation({ amount: 10 })

        expect($store.dispatch.mock.calls).toEqual([
          [`submitDelegation`, { delegations: [{ atoms: 10, delegate }] }]
        ])

        expect($store.commit.mock.calls).toEqual([
          [
            `notifyError`,
            {
              body: `Seven`,
              title: `Error While Staking atoms`
            }
          ]
        ])
      })
    })

    describe(`composition`, () => {
      it(`delegation.submitDelegation`, async () => {
        const delegation = Delegation({})

        const dispatch = jest.fn((type, payload) => {
          if (type === `submitDelegation`) {
            delegation.actions[type]($store, payload)
          }
        })

        const $store = {
          commit: jest.fn(),
          dispatch,
          getters: getterValues,
          rootState: getterValues,
          state: {
            committedDelegates: { "1a2b3c": 0 },
            unbondingDelegations: {}
          }
        }

        const {
          vm: { submitDelegation }
        } = mount(PageValidator, {
          mocks: {
            $route: { params: { validator: `1a2b3c` } },
            $store
          }
        })

        await submitDelegation({ amount: 10 })

        expect($store.dispatch.mock.calls).toEqual([
          [
            `submitDelegation`,
            {
              delegations: [
                {
                  atoms: 10,
                  delegate
                }
              ]
            }
          ],
          [
            `sendTx`,
            {
              begin_unbondings: [],
              delegations: [
                {
                  delegation: { amount: `10`, denom: `atom` },
                  delegator_addr: `cosmosaccaddr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9`,
                  validator_addr: `1a2b3c`
                }
              ],
              to: `cosmosaccaddr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9`,
              type: `updateDelegations`
            }
          ]
        ])

        expect($store.commit.mock.calls).toEqual([
          [`setAtoms`, 32],
          [
            `notify`,
            {
              body: `You have successfully staked your atoms.`,
              title: `Successful Staking!`
            }
          ]
        ])
      })
    })
  })
})

describe(`onUnstake`, () => {
  describe(`make sure there are enough atoms to unstake`, () => {
    it(`is enough`, () => {
      const localVue = createLocalVue()
      localVue.use(Vuelidate)

      const $store = {
        commit: jest.fn(),
        dispatch: jest.fn(),
        getters: Object.assign({}, getterValues, {
          delegation: { committedDelegates: { "1a2b3c": 10 } }
        })
      }

      const wrapper = mount(PageValidator, {
        localVue,
        mocks: {
          $route: { params: { validator: `1a2b3c` } },
          $store
        }
      })

      wrapper.find(`#unstake-btn`).trigger(`click`)
      expect(wrapper.contains(ModalUnstake)).toEqual(true)
    })

    it(`is not enough`, () => {
      const $store = {
        commit: jest.fn(),
        dispatch: jest.fn(),
        getters: Object.assign({}, getterValues, {
          delegation: { committedDelegates: {} }
        })
      }

      const wrapper = mount(PageValidator, {
        mocks: {
          $route: { params: { validator: `1a2b3c` } },
          $store
        }
      })

      wrapper.find(`#unstake-btn`).trigger(`click`)

      expect(
        wrapper.text().includes(`You have no atoms staked with this validator.`)
      ).toEqual(true)

      wrapper.find(`#no-bond-modal__btn`).trigger(`click`)

      expect(
        wrapper.text().includes(`You have no atoms staked with this validator.`)
      ).toEqual(false)
    })
  })

  describe(`submitUndelegation`, () => {
    describe(`unit`, () => {
      it(`success`, async () => {
        const $store = {
          commit: jest.fn(),
          dispatch: jest.fn(),
          getters: getterValues
        }

        const {
          vm: { submitUndelegation }
        } = mount(PageValidator, {
          mocks: {
            $route: { params: { validator: `1a2b3c` } },
            $store
          }
        })

        await submitUndelegation({ amount: 10 })

        expect($store.dispatch.mock.calls).toEqual([
          [`submitDelegation`, { unbondings: [{ atoms: -10, delegate }] }]
        ])

        expect($store.commit.mock.calls).toEqual([
          [
            `notify`,
            {
              body: `You have successfully unstaked 10 atoms.`,
              title: `Successful Unstaking!`
            }
          ]
        ])
      })

      it(`error`, async () => {
        const $store = {
          commit: jest.fn(),
          dispatch: jest.fn(() => {
            throw new Error(`message`)
          }),
          getters: getterValues
        }

        const {
          vm: { submitUndelegation }
        } = mount(PageValidator, {
          mocks: {
            $route: { params: { validator: `1a2b3c` } },
            $store
          }
        })

        await submitUndelegation({ amount: 10 })

        expect($store.dispatch.mock.calls).toEqual([
          [`submitDelegation`, { unbondings: [{ atoms: -10, delegate }] }]
        ])

        expect($store.commit.mock.calls).toEqual([
          [
            `notifyError`,
            {
              body: `message`,
              title: `Error While Unstaking atoms`
            }
          ]
        ])
      })

      it(`error with data`, async () => {
        const $store = {
          commit: jest.fn(),
          dispatch: jest.fn(() => {
            throw new Error(`one\ntwo\nthree\nfour\nfive\nsix"seven`)
          }),
          getters: getterValues
        }

        const {
          vm: { submitUndelegation }
        } = mount(PageValidator, {
          mocks: {
            $route: { params: { validator: `1a2b3c` } },
            $store
          }
        })

        await submitUndelegation({ amount: 10 })

        expect($store.dispatch.mock.calls).toEqual([
          [`submitDelegation`, { unbondings: [{ atoms: -10, delegate }] }]
        ])

        expect($store.commit.mock.calls).toEqual([
          [
            `notifyError`,
            {
              body: `Seven`,
              title: `Error While Unstaking atoms`
            }
          ]
        ])
      })
    })

    describe(`composition`, () => {
      it(`delegation.submitDelegation`, async () => {
        const delegation = Delegation({})

        const dispatch = jest.fn((type, payload) => {
          if (type === `submitDelegation`) {
            delegation.actions[type]($store, payload)
          }
        })

        const $store = {
          commit: jest.fn(),
          dispatch,
          getters: getterValues,
          rootState: getterValues,
          state: {
            committedDelegates: { "1a2b3c": 10 },
            unbondingDelegations: {}
          }
        }

        const {
          vm: { submitUndelegation }
        } = mount(PageValidator, {
          mocks: {
            $route: { params: { validator: `1a2b3c` } },
            $store
          }
        })

        await submitUndelegation({ amount: 10 })

        expect($store.dispatch.mock.calls).toEqual([
          [
            `submitDelegation`,
            {
              unbondings: [
                {
                  atoms: -10,
                  delegate
                }
              ]
            }
          ],
          [
            `sendTx`,
            {
              begin_unbondings: [
                {
                  delegator_addr: `cosmosaccaddr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9`,
                  shares: `10.00000000`,
                  validator_addr: `1a2b3c`
                }
              ],
              delegations: [],
              to: `cosmosaccaddr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9`,
              type: `updateDelegations`
            }
          ]
        ])

        expect($store.commit.mock.calls).toEqual([
          [`setAtoms`, 42],
          [
            `notify`,
            {
              body: `You have successfully unstaked 10 atoms.`,
              title: `Successful Unstaking!`
            }
          ]
        ])
      })
    })
  })
})
