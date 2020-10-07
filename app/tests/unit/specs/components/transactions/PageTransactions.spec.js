import PageTransactions from "transactions/PageTransactions"
import { createLocalVue, shallowMount } from "@vue/test-utils"

describe(`PageTransactions`, () => {
  const localVue = createLocalVue()
  localVue.directive(`tooltip`, () => {})

  const addresses = [
    `cosmos15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9`,
    `cosmos1pxdf0lvq5jvl9uxznklgc5gxuwzpdy5ynem546`,
  ]

  const validators = [
    { name: "cosmos1a", operatorAddress: "cosmos1a" },
    { name: "cosmos1b", operatorAddress: "cosmos1b" },
    { name: "cosmos1c", operatorAddress: "cosmos1c" },
  ]

  const transactions = [
    {
      type: "cosmos-sdk/MsgUndelegate",
      value: {
        delegator_address: "cosmos3",
        validator_address: "cosmos1e",
        amount: { denom: "uatom", amount: "50000" },
      },
      key:
        'cosmos-sdk/MsgUndelegate_2019-07-31T09:22:23.054Z_{"delegator_address":"cosmos1jq9mc3kp4nnxwryr09fpqjtrwya8q5q480zu0e","validator_address":"cosmos1a","amount":{"denom":"uatom","amount":"50000"}}',
      height: 1248479,
      timestamp: "2019-07-31T09:22:23.054Z",
      memo: "",
      fee: { amount: "4141", denom: "ATOM" },
      group: "staking",
    },
    {
      type: "cosmos-sdk/MsgSubmitProposal",
      value: {
        proposer: "cosmos15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9",
        proposal_type: "Text",
        title: "Test Proposal",
        description: "This is a test proposal",
        initial_deposit: [{ denom: "STAKE", amount: "100" }],
      },
      key:
        'cosmos-sdk/MsgSubmitProposal_undefined_{"proposer":"cosmos15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9","proposal_type":"Text","title":"Test Proposal","description":"This is a test proposal","initial_deposit":[{"denom":"STAKE","amount":"100"}]}',
      height: 56673,
      timestamp: null,
      fee: { amount: "0", denom: "ATOM" },
      group: "governance",
      liquidDate: null,
    },
    {
      type: "cosmos-sdk/MsgDeposit",
      value: {
        depositor: "cosmos15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9",
        proposal_id: "1",
        amount: [{ denom: "STAKE", amount: "100" }],
      },
      key:
        'cosmos-sdk/MsgDeposit_undefined_{"depositor":"cosmos15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9","proposal_id":"1","amount":[{"denom":"STAKE","amount":"100"}]}',
      height: 213,
      timestamp: null,
      fee: { amount: "0", denom: "ATOM" },
      group: "governance",
      liquidDate: null,
    },
    {
      type: "cosmos-sdk/BeginUnbonding",
      value: {
        validator_address: "cosmos1a",
        delegator_address: "cosmos15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9",
        shares: "5",
      },
      key:
        'cosmos-sdk/BeginUnbonding_undefined_{"validator_address":"cosmos1a","delegator_address":"cosmos15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9","shares":"5"}',
      height: 170,
      timestamp: null,
      fee: { amount: "0", denom: "ATOM" },
      liquidDate: null,
    },
  ]

  let wrapper, $store, $apollo

  const state = {
    session: {
      address: addresses[0],
      signedIn: true,
    },
    connection: {
      network: "awesomenet",
    },
  }

  $apollo = {
    queries: {
      validators: {
        loading: false,
      },
      transactions: {
        loading: false,
        variables: jest.fn(),
        fetchMore: jest.fn(() => ({
          variables: jest.fn(),
          updateQuery: jest.fn(),
        })),
      },
    },
  }

  beforeEach(() => {
    $store = {
      state,
      getters: {
        address: "cosmos1",
        network: "cosmos-hub-mainnet",
      },
    }

    wrapper = shallowMount(PageTransactions, {
      localVue,
      mocks: {
        $store,
        $apollo,
      },
      propsData: {
        transactions,
        validators,
      },
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
          $apollo,
        },
        directives: {
          infiniteScroll: () => {},
        },
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
        $apollo,
      },
      directives: {
        infiniteScroll: () => {},
      },
    })
    $store.state.session.signedIn = true
    $store.state.session.address = undefined
  })

  it("transactions updated on subscription trigger", () => {
    const self = {
      loadedTransactions: [],
    }
    let newTransaction = {
      type: "cosmos-sdk/MsgUndelegate",
      value: JSON.stringify({
        delegator_address: "cosmos2",
        validator_address: "cosmos4de",
        amount: { denom: "uatom", amount: "10000" },
      }),
      key:
        'cosmos-sdk/MsgUndelegate_2019-07-31T09:22:23.054Z_{"delegator_address":"cosmos1jq9mc3kp4nnxwryr09fpqjtrwya8q5q480zu0e","validator_address":"cosmos1a","amount":{"denom":"uatom","amount":"50000"}}',
      height: 1248479,
      timestamp: "2019-07-31T09:22:23.054Z",
      memo: "",
      fee: { amount: "4141", denom: "ATOM" },
      group: "staking",
    }
    let result = PageTransactions.apollo.transactions.update.call(self, {
      transactionsV2: [newTransaction],
    })
    // adjusting result
    newTransaction.value = JSON.parse(newTransaction.value)
    newTransaction.timestamp = new Date(newTransaction.timestamp)
    expect(result).toEqual([newTransaction])
  })

  it(`should load more transactions on loadMore action`, async () => {
    wrapper.setData({
      dataLoaded: true,
    })
    wrapper.vm.loadMore()
    // pageNumber should be updated
    expect(wrapper.vm.pageNumber).toBeGreaterThan(0)
  })

  it("transaction added on subscription trigger", () => {
    const self = {
      transactions: [],
    }
    let result = PageTransactions.apollo.transactions.subscribeToMore.updateQuery.call(
      self,
      {
        transactionsV2: [],
      },
      {
        subscriptionData: {
          data: {
            userTransactionAddedV2: {
              type: "cosmos-sdk/MsgUndelegate",
              value: {
                delegator_address: "cosmos2",
                validator_address: "cosmos4de",
                amount: { denom: "uatom", amount: "10000" },
              },
              height: 1248479,
              timestamp: "2019-07-31T09:22:23.054Z",
              memo: "",
              fee: { amount: "4141", denom: "ATOM" },
            },
          },
        },
      }
    )

    expect(result.transactionsV2.length).toBeGreaterThan(0)
  })

  it(`should not load more if currently loading`, async () => {
    wrapper = shallowMount(PageTransactions, {
      localVue,
      mocks: {
        $store,
        $apollo,
      },
      directives: {
        infiniteScroll: () => {},
      },
    })
    wrapper.setData({
      dataLoaded: false,
    })
    wrapper.vm.loadMore()
    // pageNumber should not have updated
    expect(wrapper.vm.pageNumber).toBe(0)
  })

  it(`validator address map to be correct`, async () => {
    wrapper = shallowMount(PageTransactions, {
      localVue,
      mocks: {
        $store,
        $apollo,
      },
      directives: {
        infiniteScroll: () => {},
      },
    })
    wrapper.setData({ validators })
    expect(Object.keys(wrapper.vm.validatorsAddressMap)).toEqual([
      "cosmos1a",
      "cosmos1b",
      "cosmos1c",
    ])
  })
})
