import PageTransactions from "wallet/PageTransactions"
import { createLocalVue, shallowMount } from "@vue/test-utils"

describe(`PageTransactions`, () => {
  const localVue = createLocalVue()
  localVue.directive(`tooltip`, () => {})

  const addresses = [
    `cosmos15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9`,
    `cosmos1pxdf0lvq5jvl9uxznklgc5gxuwzpdy5ynem546`
  ]
  const validators = {
    cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctqzh8yqw: {
      operator_address: `cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctqzh8yqw`,
      pub_key: `cosmosvalpub1234`,
      revoked: false,
      tokens: `14`,
      delegator_shares: `14`,
      description: {
        website: `www.monty.ca`,
        details: `Mr Mounty`,
        moniker: `mr_mounty`,
        country: `Canada`
      },
      status: 2,
      bond_height: `0`,
      bond_intra_tx_counter: 6,
      proposer_reward_pool: null,
      commission: {
        rate: `0`,
        max_rate: `0`,
        max_change_rate: `0`,
        update_time: `1970-01-01T00:00:00Z`
      },
      prev_bonded_shares: `0`
    },
    cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctplpn3au: {
      operator_address: `cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctplpn3au`,
      pub_key: `cosmosvalpub5678`,
      revoked: false,
      tokens: `0`,
      delegator_shares: `0`,
      description: {
        website: `www.greg.com`,
        details: `Good Guy Greg`,
        moniker: `good_greg`,
        country: `USA`
      },
      status: 2,
      bond_height: `0`,
      bond_intra_tx_counter: 6,
      proposer_reward_pool: null,
      commission: {
        rate: `0`,
        max_rate: `0`,
        max_change_rate: `0`,
        update_time: new Date(Date.now()).toISOString()
      },
      prev_bonded_shares: `0`
    },
    cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctgurrg7n: {
      operator_address: `cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctgurrg7n`,
      pub_key: `cosmosvalpub8910`,
      tokens: `19`,
      delegator_shares: `19`,
      description: {
        details: `Herr Schmidt`,
        website: `www.schmidt.de`,
        moniker: `herr_schmidt_revoked`,
        country: `DE`
      },
      revoked: true,
      status: 2,
      bond_height: `0`,
      bond_intra_tx_counter: 6,
      proposer_reward_pool: null,
      commission: {
        rate: `0`,
        max_rate: `0`,
        max_change_rate: `0`,
        update_time: new Date(Date.now()).toISOString()
      },
      prev_bonded_shares: `0`
    }
  }

  const flatOrderedTransactionList = [
    {
      type: "cosmos-sdk/MsgUndelegate",
      value: {
        delegator_address: "cosmos3",
        validator_address: "cosmos4",
        amount: { denom: "uatom", amount: "50000" }
      },
      key:
        'cosmos-sdk/MsgUndelegate_2019-07-31T09:22:23.054Z_{"delegator_address":"cosmos1jq9mc3kp4nnxwryr09fpqjtrwya8q5q480zu0e","validator_address":"cosmosvaloper1vrg6ruw00lhszl4sjgwt5ldvl8z0f7pfp5va85","amount":{"denom":"uatom","amount":"50000"}}',
      blockNumber: 1248479,
      time: "2019-07-31T09:22:23.054Z",
      memo: "",
      fees: { denom: "uatom", amount: "4141" },
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
      blockNumber: 56673,
      time: null,
      fees: { amount: "0", denom: "ATOM" },
      group: "governance",
      liquidDate: null
    },
    {
      type: "cosmos-sdk/MsgDeposit",
      value: {
        depositor: "cosmos15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9",
        id: "1",
        amount: [{ denom: "STAKE", amount: "100" }]
      },
      key:
        'cosmos-sdk/MsgDeposit_undefined_{"depositor":"cosmos15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9","id":"1","amount":[{"denom":"STAKE","amount":"100"}]}',
      blockNumber: 213,
      time: null,
      fees: { amount: "0", denom: "ATOM" },
      group: "governance",
      liquidDate: null
    },
    {
      type: "cosmos-sdk/BeginUnbonding",
      value: {
        validator_address:
          "cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctqzh8yqw",
        delegator_address: "cosmos15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9",
        shares: "5"
      },
      key:
        'cosmos-sdk/BeginUnbonding_undefined_{"validator_address":"cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctqzh8yqw","delegator_address":"cosmos15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9","shares":"5"}',
      blockNumber: 170,
      time: null,
      fees: { amount: "0", denom: "ATOM" },
      liquidDate: null
    },
    {
      type: "cosmos-sdk/MsgDelegate",
      value: {
        validator_address:
          "cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctqzh8yqw",
        delegator_address: "cosmos15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9",
        delegation: { amount: "24", denom: "STAKE" }
      },
      key:
        'cosmos-sdk/MsgDelegate_undefined_{"validator_address":"cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctqzh8yqw","delegator_address":"cosmos15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9","delegation":{"amount":"24","denom":"STAKE"}}',
      blockNumber: 160,
      time: null,
      fees: { amount: "0", denom: "ATOM" },
      group: "staking",
      liquidDate: null
    },
    {
      type: "cosmos-sdk/MsgSend",
      value: {
        from_address: "cosmos15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9",
        to_address: "cosmos1pxdf0lvq5jvl9uxznklgc5gxuwzpdy5ynem546",
        amount: [{ denom: "fabocoins", amount: "1234" }]
      },
      key:
        'cosmos-sdk/MsgSend_undefined_{"from_address":"cosmos15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9","to_address":"cosmos1pxdf0lvq5jvl9uxznklgc5gxuwzpdy5ynem546","amount":[{"denom":"fabocoins","amount":"1234"}]}',
      blockNumber: 150,
      time: null,
      fees: { amount: "0", denom: "ATOM" },
      group: "banking",
      liquidDate: null
    },
    {
      type: "cosmos-sdk/MsgSend",
      value: {
        from_address: "cosmos1pxdf0lvq5jvl9uxznklgc5gxuwzpdy5ynem546",
        to_address: "cosmos15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9",
        amount: [{ denom: "jbcoins", amount: "1234" }]
      },
      key:
        'cosmos-sdk/MsgSend_undefined_{"from_address":"cosmos1pxdf0lvq5jvl9uxznklgc5gxuwzpdy5ynem546","to_address":"cosmos15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9","amount":[{"denom":"jbcoins","amount":"1234"}]}',
      blockNumber: 1,
      time: null,
      fees: { amount: "0", denom: "ATOM" },
      group: "banking",
      liquidDate: null
    }
  ]

  let wrapper, $store

  const getters = {
    flatOrderedTransactionList,
    validators
  }

  const state = {
    transactions: {
      loading: false,
      loaded: true,
      error: undefined
    },
    session: {
      address: addresses[0],
      signedIn: true
    }
  }

  beforeEach(() => {
    $store = {
      commit: jest.fn(),
      dispatch: jest.fn(),
      state,
      getters: JSON.parse(JSON.stringify(getters)) // clone so we don't overwrite by accident
    }
  })

  describe(`Renders correctly`, () => {
    it(`and loads transactions`, async () => {
      wrapper = shallowMount(PageTransactions, {
        localVue,
        mocks: {
          $store
        },
        directives: {
          infiniteScroll: () => {}
        }
      })
      expect(wrapper.element).toMatchSnapshot()
      expect($store.dispatch).toHaveBeenCalledWith(`getAllTxs`)
    })

    it(`and does not load transactions if the user has not signed in`, async () => {
      $store.state.session.signedIn = false
      $store.state.session.address = undefined

      wrapper = shallowMount(PageTransactions, {
        localVue,
        mocks: {
          $store
        },
        directives: {
          infiniteScroll: () => {}
        }
      })
      expect(wrapper.element).toMatchSnapshot()
      expect($store.dispatch).not.toHaveBeenCalledWith()
    })
  })

  it(`should refresh the transaction history when signed in`, async () => {
    $store.state.session.signedIn = false
    $store.state.session.address = undefined

    wrapper = shallowMount(PageTransactions, {
      localVue,
      mocks: {
        $store
      },
      directives: {
        infiniteScroll: () => {}
      }
    })
    expect($store.dispatch).not.toHaveBeenCalledWith(`getAllTxs`)
    $store.state.session.signedIn = true
    $store.state.session.address = undefined
    expect($store.dispatch).toHaveBeenCalledWith(`getAllTxs`)
  })

  it(`should load more transactions (infinite scrolling)`, async () => {
    wrapper = shallowMount(PageTransactions, {
      localVue,
      mocks: {
        $store
      },
      directives: {
        infiniteScroll: () => {}
      }
    })
    wrapper.setData({ showing: 2 })
    expect(wrapper.vm.showingTransactions.length).toBe(2)
    wrapper.vm.loadMore()
    expect(wrapper.vm.showingTransactions.length).toBe(7)
  })
})
