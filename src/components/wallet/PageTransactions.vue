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
      <div v-infinite-scroll="loadMore" infinite-scroll-distance="80">
        <TransactionList
          :transactions="transactions"
          :address="address"
          :validators="validatorsAddressMap"
        />
      </div>
      <br />
    </template>
  </TmPage>
</template>

<script>
import { mapGetters } from "vuex"
import DataEmptyTx from "common/TmDataEmptyTx"
import TmPage from "common/TmPage"
import TransactionList from "transactions/TransactionList"
import gql from "graphql-tag"

export default {
  name: `page-transactions`,
  components: {
    TransactionList,
    DataEmptyTx,
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
    }
  },
  apollo: {
    transactions: {
      query: gql`
        query transactions($networkId: String!, $address: String!) {
          transactions(networkId: $networkId, address: $address) {
            hash
            type
            group
            height
            timestamp
            gasUsed
            fee {
              amount
              denom
            }
            value
            undelegationEndTime
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
        if (Array.isArray(result.transactions)) {
          return result.transactions.map(tx => ({
            ...tx,
            timestamp: new Date(tx.timestamp),
            value: JSON.parse(tx.value)
          }))
        }
        return []
      },
      subscribeToMore: {
        document: gql`
          subscription($networkId: String!, $address: String!) {
            userTransactionAdded(networkId: $networkId, address: $address) {
              hash
              type
              group
              height
              timestamp
              gasUsed
              fee {
                amount
                denom
              }
              value
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
