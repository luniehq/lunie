<template>
  <TmPage
    :managed="true"
    :loading="$apollo.queries.transactions.loading"
    :loaded="!$apollo.queries.transactions.loading"
    :error="$apollo.queries.transactions.error"
    :data-empty="transactions.length === 0"
    data-title="Transactions"
    :sign-in-required="true"
    :hide-header="true"
  >
    <DataEmptyTx slot="no-data" />
    <template slot="managed-body">
      <!-- <div v-infinite-scroll="loadMore" infinite-scroll-distance="80">
        <TransactionList
          :transactions="transactions"
          :address="address"
          :validators="validatorsAddressMap"
        />
      </div> -->

      <div v-for="transaction in transactions" :key="transaction.hash">
        {{ transaction }}
      </div>

      <br />
      <TmDataMsg icon="calendar_today">
        <div slot="title">
          Looking for older transactions?
        </div>
        <div slot="subtitle">
          Unfortunately, we can't display transactions from previous chains
          right now.
          <a class="intercom-button" @click="handleIntercom()">Let us know</a>
          if you'd like access these transactions.
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
// import TransactionList from "transactions/TransactionList"
import gql from "graphql-tag"

export default {
  name: `page-transactions`,
  components: {
    // TransactionList,
    DataEmptyTx,
    TmDataMsg,
    TmPage
  },
  data: () => ({
    showing: 15,
    validators: [],
    transactions: []
  }),
  computed: {
    ...mapGetters([`address`, `network`]),
    validatorsAddressMap() {
      const names = {}
      this.validators.forEach(item => {
        names[item.operatorAddress] = item
      })
      return names
    },
    dataEmpty() {
      return this.transactions.length === 0
    }
  },
  methods: {
    loadMore() {
      this.showing += 10
    },
    handleIntercom() {
      this.$store.dispatch(`displayMessenger`)
    }
  },
  apollo: {
    transactions: {
      query: gql`
        query transactionsV2($networkId: String!, $address: String!) {
          transactionsV2(networkId: $networkId, address: $address) {
            type
            hash
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
                amount {
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
          }
        }
      `,
      skip() {
        return !this.address
      },
      variables() {
        return {
          networkId: this.network,
          address: this.address
        }
      },
      update: result => {
        console.log(result)
        if (Array.isArray(result.transactions)) {
          return result.transactions
        }
        return []
      },
      subscribeToMore: {
        document: gql`
          subscription($networkId: String!, $address: String!) {
            userTransactionAddedV2(networkId: $networkId, address: $address) {
              type
              hash
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
                  amount {
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
            }
          }
        `,
        updateQuery: (previousResult, { subscriptionData }) => {
          return {
            transactions: [
              subscriptionData.data.userTransactionAdded,
              ...previousResult.transactions
            ]
          }
        },
        variables() {
          return {
            networkId: this.network,
            address: this.address
          }
        }
      }
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
          networkId: this.network
        }
      }
    }
  }
}
</script>
