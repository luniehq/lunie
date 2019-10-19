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
      <div infinite-scroll-distance="80">
        <TransactionList
          :transactions="transactions"
          :address="session.address"
          :validators="validatorsAddressMap"
        />
      </div>
      <br />
    </template>
  </TmPage>
</template>

<script>
import { mapState } from "vuex"
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
    ...mapState([`session`]),
    ...mapState({ network: state => state.connection.network }),
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
          }
        }
      `,
      skip() {
        return !this.session.address
      },
      variables() {
        return {
          networkId: this.network,
          address: this.session.address
        }
      },
      update: result => {
        if (Array.isArray(result.transactions)) {
          return result.transactions.map(transaction => {
            !transaction.value && console.log("TX ERROR")
            const newTx = {
              ...transaction,
              value: JSON.parse(transaction.value),
              timestamp: new Date(transaction.timestamp)
            }
            return newTx
          })
        }
        return []
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
      variables() {
        return {
          networkId: this.network
        }
      }
    }
  }
}
</script>
