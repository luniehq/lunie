import PageValidator from "staking/PageValidator"
import { shallowMount, createLocalVue } from "@vue/test-utils"

const validator = {
  networkId: "cosmoshub",
  operatorAddress: "cosmosvaloper1abcdefghijklmnop",
  consensusPubkey: "cosmosvalconspub11234567890",
  jailed: false,
  details: "The Validator",
  website: "http://validator.com/",
  identity: "ABCDEFGHIJKL",
  votingPower: "0.014",
  startHeight: 190459,
  uptimePercentage: "1",
  tokens: "123456789",
  updateTime: new Date("2019-05-31"),
  commission: "0.070000000000000000",
  maxCommission: "0.150000000000000000",
  maxChangeCommission: "0.030000000000000000",
  commissionLastUpdate: null,
  height: 12345,
  status: `asdadas`,
  statusDetailed: "active",
  delegations: null,
  selfStake: {
    amount: 123
  },
  expectedReturns: "123",
  picture: "picture.jpg",
  name: "",
  userShares: {
    amount: 123
  }
}

describe(`PageValidator`, () => {
  let wrapper, $store, $apollo
  const localVue = createLocalVue()
  localVue.directive(`tooltip`, () => {})

  beforeEach(() => {
    $store = {
      state: {
        session: {
          signedIn: true,
          address: `cosmos15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9`
        },
        connection: {
          network: "networkId"
        }
      }
    }
    $apollo = {
      queries: {
        validator: {
          loading: false,
          error: false,
          refetch: () => {}
        },
        rewards: {
          loading: false,
          error: false,
          refetch: () => {}
        },
        delegation: {
          refetch: () => {}
        }
      }
    }
    wrapper = shallowMount(PageValidator, {
      localVue,
      mocks: {
        $store,
        $apollo,
        $route: {
          params: { validator: validator.operator_address }
        }
      },
      stubs: [`router-link`]
    })
    wrapper.setProps({ validator })
  })

  // describe(`shows a validator profile information`, () => {
  it(`if user has signed in`, () => {
    expect(wrapper.element).toMatchSnapshot()
  })
  it(`if user hasn't signed in`, () => {
    $store.state.session.signedIn = false
    expect(wrapper.element).toMatchSnapshot()
  })
})
