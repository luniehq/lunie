<template>
  <TmPage
    :managed="true"
    :loading="$apollo.queries.transactions.loading && dataEmpty"
    :loaded="!$apollo.queries.transactions.loading && !dataEmpty"
    :error="$apollo.queries.transactions.error"
    :data-empty="transactions.length === 0"
    data-title="Transactions"
    :sign-in-required="true"
    :hide-header="true"
  >
    <DataEmptyTx slot="no-data" />
    <template slot="managed-body">
      <div>
        <EventList
          :events="transactions"
          :more-available="moreAvailable"
          @loadMore="loadMore"
        >
          <template slot-scope="event">
            <TransactionItem
              :key="event.key"
              :transaction="event"
              :validators="validatorsAddressMap"
              :address="address"
            />
          </template>
        </EventList>
      </div>
      <br />
      <TmDataMsg icon="calendar_today">
        <div slot="title">
          Looking for older transactions?
        </div>
        <div slot="subtitle">
          <p>
            Lunie cannot display transactions from previous chains in your
            activity page.
          </p>
          <p>
            If you would like to view information from previous chain upgrades
            please visit our
            <a
              href="https://intercom.help/lunie/en/articles/3787014-how-to-get-blockchain-data-from-previous-chain-upgrades"
              >Help Center.</a
            >
          </p>
        </div>
      </TmDataMsg>
    </template>
  </TmPage>
</template>

<script>
import { mapGetters } from "vuex"
import DataEmptyTx from "common/TmDataEmptyTx"
import TmDataMsg from "common/TmDataMsg"
import TmPage from "common/TmPage"
import EventList from "common/EventList"
import TransactionItem from "transactions/TransactionItem"
import gql from "graphql-tag"
import uniqBy from "lodash.uniqby"

const txFields = `
  type
  hash
  key
  height
  timestamp
  memo
  success
  fees {
    denom
    amount
  }
  details {
    ... on SendTx {
      from
      to
      amount {
        denom
        amount
      }
    }
    ... on StakeTx {
      to
      amount {
        denom
        amount
      }
    }
    ... on RestakeTx {
      to
      from
      amount {
        denom
        amount
      }
    }
    ... on UnstakeTx {
      from
      amount {
        denom
        amount
      }
    }
    ... on ClaimRewardsTx {
      from
      amounts {
        denom
        amount
      }
    }
    ... on SubmitProposalTx {
      proposalType
      proposalTitle
      proposalDescription
      initialDeposit {
        denom
        amount
      }
    }
    ... on VoteTx {
      proposalId
      voteOption
    }
    ... on DepositTx {
      proposalId
      amount {
        denom
        amount
      }
    }
  }
`

export default {
  name: `page-transactions`,
  components: {
    TransactionItem,
    EventList,
    DataEmptyTx,
    TmDataMsg,
    TmPage,
  },
  data: () => ({
    pageNumber: 0,
    validators: [],
    transactions: [],
    dataLoaded: false,
    moreAvailable: true,
  }),
  computed: {
    ...mapGetters([`address`, `network`]),
    validatorsAddressMap() {
      const names = {}
      this.validators.forEach((item) => {
        names[item.operatorAddress] = item
      })
      return names
    },
    dataEmpty() {
      return this.transactions.length === 0
    },
  },
  methods: {
    loadMore() {
      // preload next transactions before scroll end and check if last loading loads new records
      // to prevent multiple requests
      if (this.dataLoaded === true) {
        // loads new portion
        this.pageNumber++
        this.dataLoaded = false
        this.$apollo.queries.transactions.fetchMore({
          // New variables
          variables: {
            networkId: this.network,
            address: this.address,
            pageNumber: this.pageNumber,
          },
          // Transform the previous result with new data
          updateQuery: (previousResult, { fetchMoreResult }) => {
            return {
              // DEPRECATE uniqBy, should be resolved via API
              transactionsV2: uniqBy(
                [
                  ...previousResult.transactionsV2,
                  ...fetchMoreResult.transactionsV2,
                ],
                "key"
              ),
            }
          },
        })
      }
    },
    handleIntercom() {
      this.$store.dispatch(`displayMessenger`)
    },
  },
  apollo: {
    transactions: {
      query: gql`
        query transactionsV2($networkId: String!, $address: String!, $pageNumber: Int) {
          transactionsV2(networkId: $networkId, address: $address, pageNumber: $pageNumber) {
            ${txFields}
          }
        }
      `,
      skip() {
        return !this.address
      },
      variables() {
        return {
          networkId: this.network,
          address: this.address,
          pageNumber: 0,
        }
      },
      update(result) {
        this.dataLoaded = true
        this.moreAvailable = (result.transactionsV2.length > 0)
        return result.transactionsV2
      },
      subscribeToMore: {
        document: gql`
          subscription($networkId: String!, $address: String!) {
            userTransactionAddedV2(networkId: $networkId, address: $address) {
              ${txFields}
            }
          }
        `,
        updateQuery: (previousResult, { subscriptionData }) => {
          if (previousResult && subscriptionData.data.userTransactionAddedV2) {
            return {
              transactionsV2: [
                subscriptionData.data.userTransactionAddedV2,
                ...previousResult.transactionsV2,
              ],
            }
          }
        },
        /* istanbul ignore next */
        variables() {
          return {
            networkId: this.network,
            address: this.address,
          }
        },
      },
    },
    validators: {
      query: gql`
        query validators($networkId: String!) {
          validators(networkId: $networkId) {
            name
            operatorAddress
            picture
          }
        }
      `,
      skip() {
        return !this.address
      },
      variables() {
        return {
          networkId: this.network,
        }
      },
    },
  },
}
</script>
