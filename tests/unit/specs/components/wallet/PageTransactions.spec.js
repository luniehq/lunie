import PageTransactions from "wallet/PageTransactions"
import { createLocalVue, shallowMount } from "@vue/test-utils"

describe(`PageTransactions`, () => {
  const localVue = createLocalVue()
  localVue.directive(`tooltip`, () => {})

  const addresses = [
    `cosmos15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9`,
    `cosmos1pxdf0lvq5jvl9uxznklgc5gxuwzpdy5ynem546`
  ]

  const validators = [
    { name: "cosmos1a", operatorAddress: "cosmos1a" },
    { name: "cosmos1b", operatorAddress: "cosmos1b" },
    { name: "cosmos1c", operatorAddress: "cosmos1c" }
  ]

  const transactions = [
    {
      type: "cosmos-sdk/MsgUndelegate",
      value: {
        delegator_address: "cosmos3",
        validator_address: "cosmos1e",
        amount: { denom: "uatom", amount: "50000" }
      },
      key:
        'cosmos-sdk/MsgUndelegate_2019-07-31T09:22:23.054Z_{"delegator_address":"cosmos1jq9mc3kp4nnxwryr09fpqjtrwya8q5q480zu0e","validator_address":"cosmos1a","amount":{"denom":"uatom","amount":"50000"}}',
      height: 1248479,
      timestamp: "2019-07-31T09:22:23.054Z",
      memo: "",
      fee: { amount: "4141", denom: "ATOM" },
      group: "staking"
    },
    {
      type: "cosmos-sdk/MsgSubmitProposal",
      value: {
        proposer: "cosmos15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9",
        proposal_type: "Text",
        title: "Test Proposal",
        description: "This is a test proposal",
        initial_deposit: [{ denom: "STAKE", amount: "100" }]
      },
      key:
        'cosmos-sdk/MsgSubmitProposal_undefined_{"proposer":"cosmos15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9","proposal_type":"Text","title":"Test Proposal","description":"This is a test proposal","initial_deposit":[{"denom":"STAKE","amount":"100"}]}',
      height: 56673,
      timestamp: null,
      fee: { amount: "0", denom: "ATOM" },
      group: "governance",
      liquidDate: null
    },
    {
      type: "cosmos-sdk/MsgDeposit",
      value: {
        depositor: "cosmos15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9",
        proposal_id: "1",
        amount: [{ denom: "STAKE", amount: "100" }]
      },
      key:
        'cosmos-sdk/MsgDeposit_undefined_{"depositor":"cosmos15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9","proposal_id":"1","amount":[{"denom":"STAKE","amount":"100"}]}',
      height: 213,
      timestamp: null,
      fee: { amount: "0", denom: "ATOM" },
      group: "governance",
      liquidDate: null
    },
    {
      type: "cosmos-sdk/BeginUnbonding",
      value: {
        validator_address: "cosmos1a",
        delegator_address: "cosmos15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9",
        shares: "5"
      },
      key:
        'cosmos-sdk/BeginUnbonding_undefined_{"validator_address":"cosmos1a","delegator_address":"cosmos15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9","shares":"5"}',
      height: 170,
      timestamp: null,
      fee: { amount: "0", denom: "ATOM" },
      liquidDate: null
    }
  ]

  let wrapper, $store, $apollo

  const state = {
    session: {
      address: addresses[0],
      signedIn: true
    },
    connection: {
      network: "awesomenet"
    }
  }

  $apollo = {
    queries: {
      validators: {
        loading: false
      },
      transactions: {
        loading: false
      }
    }
  }

  beforeEach(() => {
    $store = {
      state,
      getters: {
        address: "cosmos1"
      }
    }

    wrapper = shallowMount(PageTransactions, {
      localVue,
      mocks: {
        $store,
        $apollo
      },
      directives: {
        infiniteScroll: () => {}
      },
      propsData: {
        transactions,
        validators
      }
    })
    wrapper.setData({ transactions, validators })
  })

  describe(`Renders correctly`, () => {
    it(`and loads transactions`, async () => {
      expect(wrapper.element).toMatchSnapshot()
    })

    it(`and does not load transactions if the user has not signed in`, async () => {
      $store.state.session.signedIn = false
      $store.state.session.address = undefined

      wrapper = shallowMount(PageTransactions, {
        localVue,
        mocks: {
          $store,
          $apollo
        },
        directives: {
          infiniteScroll: () => {}
        }
      })
      wrapper.setProps({ transactions, validators })
      expect(wrapper.element).toMatchSnapshot()
    })
  })

  it(`should refresh the transaction history when signed in`, async () => {
    $store.state.session.signedIn = false
    $store.state.session.address = undefined

    wrapper = shallowMount(PageTransactions, {
      localVue,
      mocks: {
        $store,
        $apollo
      },
      directives: {
        infiniteScroll: () => {}
      }
    })
    $store.state.session.signedIn = true
    $store.state.session.address = undefined
  })

  it(`should load more transactions (infinite scrolling)`, async () => {
    wrapper = shallowMount(PageTransactions, {
      localVue,
      mocks: {
        $store,
        $apollo
      },
      directives: {
        infiniteScroll: () => {}
      }
    })
    wrapper.setData({ showing: 2 })
    wrapper.vm.loadMore()
  })

  it(`validator address map to be correct`, async () => {
    wrapper = shallowMount(PageTransactions, {
      localVue,
      mocks: {
        $store,
        $apollo
      },
      directives: {
        infiniteScroll: () => {}
      }
    })
    wrapper.setData({ validators })
    expect(Object.keys(wrapper.vm.validatorsAddressMap)).toEqual([
      "cosmos1a",
      "cosmos1b",
      "cosmos1c"
    ])
  })
})
