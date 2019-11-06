import { shallowMount, createLocalVue } from "@vue/test-utils"
import VueApollo from "vue-apollo"
import LiValidator from "src/components/staking/LiValidator"

const localVue = createLocalVue()
localVue.directive(`tooltip`, () => {})
localVue.use(VueApollo)

describe(`LiValidator`, () => {
  let wrapper, $store

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
    updateTime: "2019-05-31T23:54:12.176123478Z",
    commission: "0.070000000000000000",
    maxCommission: "0.150000000000000000",
    maxChangeCommission: "0.030000000000000000",
    commissionLastUpdate: null,
    height: 12345,
    status: "ACTIVE",
    statusDetailed: "active",
    delegations: null,
    selfStake: {
      amount: 123
    },
    expectedReturns: "123",
    customized: null,
    tombstoned: null,
    keybaseId: null,
    lastUpdated: null,
    minSelfDelegation: null,
    profileUrl: null,
    userName: null,
    picture: "picture.jpg",
    name: "",
    userShares: {
      amount: 123
    }
  }

  const index = 1

  beforeEach(() => {
    $store = {
      state: {
        pool: {
          pool: {
            bonded_tokens: 1000
          }
        }
      }
    }

    wrapper = shallowMount(LiValidator, {
      localVue,
      propsData: {
        validator,
        index,
        showOnMobile: "returns"
      },
      mocks: {
        $store
      },
      stubs: [`router-link`]
    })
  })

  it(`has the expected html structure`, () => {
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`should show the voting power`, () => {
    expect(wrapper.html()).toContain(`1.40%`)
  })

  it(`should gravatar when no avatar`, () => {
    wrapper.setProps({
      validator: {
        ...validator,
        picture: ""
      }
    })
    expect(wrapper.find("avatar-stub").exists())
  })
})
