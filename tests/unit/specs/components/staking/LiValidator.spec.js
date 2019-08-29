import { shallowMount, createLocalVue } from "@vue/test-utils"
import VueApollo from "vue-apollo"
import LiValidator from "src/components/staking/LiValidator"

const localVue = createLocalVue()
localVue.directive(`tooltip`, () => {})
localVue.use(VueApollo)

describe(`LiValidator`, () => {
  let wrapper, $store

  const validator = {
    //From GraphQL
    avatarUrl: "https://s3.amazonaws.com/img/path.jpg",
    consensus_pubkey: "cosmosvalpub1234",
    customized: false,
    delegator_shares: "697935712090.000000000000000000",
    details: "Mr Mounty",
    id: "9cfd0f08-c750-4cde-a267-e5a38feede20",
    identity: "4BE49EABAA41B8BF",
    jailed: false,
    keybaseId: "4BE49EABAA41B8BF",
    lastUpdated: "2019-08-15T16:03:34.988007+00:00",
    max_change_rate: "0.010000000000000000",
    max_rate: "0.500000000000000000",
    min_self_delegation: "1",
    moniker: "mr_mounty",
    operator_address: "cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctplpn3au",
    profileUrl: "https://keybase.io/melea",
    rate: "0.080000000000000000",
    status: 2,
    tokens: 14,
    unbonding_height: 556130,
    unbonding_time: "2019-06-26T23:50:09.38840326Z",
    update_time: "2019-04-01T17:07:19.892771401Z",
    uptime_percentage: "0.9962",
    userName: "mr_mounty",
    website: "www.monty.ca",

    // Enriched locally
    expectedReturns: 0.13
  }

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
})
