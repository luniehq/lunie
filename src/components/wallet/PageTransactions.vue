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
import { AllValidators, validatorsResult } from "src/gql"
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
    // showingTransactions() {
    //   return this.flatOrderedTransactionList.slice(0, this.showing)
    // },
    dataEmpty() {
      return this.transactions.length === 0
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
      variables() {
        return {
          networkId: this.network,
          address: this.session.address
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
      }
    },
    validators: {
      query() {
        /* istanbul ignore next */
        return AllValidators(this.network)
      },
      update(data) {
        /* istanbul ignore next */
        return validatorsResult(this.network)(data)
      }
    }
  }
}
</script>
