import setup from "../../../helpers/vuex-setup"
import PageValidator from "renderer/components/staking/PageValidator"
import { mount } from "@vue/test-utils"

// Create a getters object from an object of simple values.
const mockGetters = values =>
  Object.assign(
    ...Object.entries(values).map(([key, value]) => ({ [key]: () => value }))
  )

const getterValues = {
  bondingDenom: `atom`,
  config: { desktop: false },
  delegates: {
    delegates: [
      {
        owner: "1a2b3c",
        pub_key: {
          type: "AC26791624DE60",
          data: "dlN5SLqeT3LT9WsUK5iuVq1eLQV2Q1JQAuyN0VwSWK0="
        },
        tokens: "19",
        delegator_shares: "19",
        description: {
          description: "Herr Schmidt",
          moniker: "herr_schmidt_revoked",
          country: "DE"
        },
        revoked: true,
        status: 2,
        bond_height: "0",
        bond_intra_tx_counter: 6,
        proposer_reward_pool: null,
        commission: "0",
        commission_max: "0",
        commission_change_rate: "0",
        commission_change_today: "0",
        prev_bonded_shares: "0"
      }
    ]
  },
  delegation: {
    committedDelegates: { "1a2b3c": 0 },
    unbondingDelegations: {}
  },
  keybase: `keybase`
}

describe("PageValidator", () => {
  let wrapper
  let { mount } = setup()

  beforeEach(() => {
    let instance = mount(PageValidator, {
      doBefore: ({ router }) => {
        router.push("/staking/validators/1a2b3c")
      },
      getters: mockGetters(getterValues)
    })
    wrapper = instance.wrapper
  })

  it("has the expected html structure", async () => {
    // after importing the @tendermint/ui components from modules
    // the perfect scroll plugin needs a $nextTick and a wrapper.update
    // to work properly in the tests (snapshots weren't matching)
    // this has occured across multiple tests
    await wrapper.vm.$nextTick()
    wrapper.update()
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it("should return one delegate based on route params", () => {
    expect(wrapper.vm.validator.owner).toEqual("1a2b3c")
  })

  it("shows a default avatar", () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it("shows a default value if no moniker is set", () => {
    let instance = mount(PageValidator, {
      doBefore: ({ router }) => {
        router.push("/staking/validators/1a2b3c")
      },
      getters: {
        config: () => ({ desktop: false }),
        delegates: () => ({
          delegates: [
            {
              owner: "1a2b3c",
              pub_key: {
                type: "AC26791624DE60",
                data: "dlN5SLqeT3LT9WsUK5iuVq1eLQV2Q1JQAuyN0VwSWK0="
              },
              tokens: "19",
              delegator_shares: "19",
              description: {
                description: "Herr Schmidt",
                moniker: null,
                country: "DE"
              },
              revoked: true,
              status: 2,
              bond_height: "0",
              bond_intra_tx_counter: 6,
              proposer_reward_pool: null,
              commission: "0",
              commission_max: "0",
              commission_change_rate: "0",
              commission_change_today: "0",
              prev_bonded_shares: "0"
            }
          ]
        })
      }
    })
    wrapper = instance.wrapper

    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it("shows an error if the validator couldn't be found", () => {
    let instance = mount(PageValidator, {
      doBefore: ({ router }) => {
        router.push("/staking/validators/1a2b3c")
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
})

describe(`onStake`, () => {
  // Create our own PageValidator here because the one above contains way too
  // much magic.

  it(`success`, async () => {
    const $store = {
      commit: jest.fn(),
      dispatch: jest.fn(),
      getters: getterValues
    }

    const {
      vm: { onStake }
    } = mount(PageValidator, {
      mocks: {
        $route: { params: { validator: `1a2b3c` } },
        $store
      }
    })

    await onStake({ amount: 10 })

    expect($store.dispatch.mock.calls).toEqual([
      [`submitDelegation`, [{ atoms: 10, delegate: { owner: `1a2b3c` } }]]
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
      vm: { onStake }
    } = mount(PageValidator, {
      mocks: {
        $route: { params: { validator: `1a2b3c` } },
        $store
      }
    })

    await onStake({ amount: 10 })

    expect($store.dispatch.mock.calls).toEqual([
      [`submitDelegation`, [{ atoms: 10, delegate: { owner: `1a2b3c` } }]]
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
      vm: { onStake }
    } = mount(PageValidator, {
      mocks: {
        $route: { params: { validator: `1a2b3c` } },
        $store
      }
    })

    await onStake({ amount: 10 })

    expect($store.dispatch.mock.calls).toEqual([
      [`submitDelegation`, [{ atoms: 10, delegate: { owner: `1a2b3c` } }]]
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
