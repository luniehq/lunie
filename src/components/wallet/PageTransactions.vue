<template>
  <TmPage
    :managed="true"
    :loading="$apollo.queries.bankTransactions.loading"
    :loaded="!$apollo.queries.bankTransactions.loading"
    :error="$apollo.queries.bankTransactions.error"
    :data-empty="bankTransactions.length === 0"
    data-title="Transactions"
    :sign-in-required="true"
    :hide-header="true"
  >
    <DataEmptyTx slot="no-data" />
    <template slot="managed-body">
      <div infinite-scroll-distance="80">
        <TransactionList
          :transactions="bankTransactions"
          :address="session.address"
          :validators="validatorsAddressMap"
        />
      </div>
      <br />
    </template>
  </TmPage>
</template>

<script>
import { mapState, mapGetters } from "vuex"
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
    bankTransactions: []
  }),
  computed: {
    ...mapState([`session`, `transactions`]),
    ...mapState({ network: state => state.connection.network }),
    ...mapGetters([`flatOrderedTransactionList`]),
    validatorsAddressMap() {
      const names = {}
      this.validators.forEach(item => {
        names[item.operatorAddress] = item
      })
      return names
    },
    showingTransactions() {
      return this.flatOrderedTransactionList.slice(0, this.showing)
    },
    dataEmpty() {
      return this.flatOrderedTransactionList.length === 0
    }
  },
  updated() {
    console.log(this.bankTransactions)
  },
  // watch: {
  //   "session.signedIn": function() {
  //     this.refreshTransactions()
  //   }
  // },
  // created() {
  // this.refreshTransactions()
  // },
  // methods: {
  //   async refreshTransactions() {
  //     if (this.session.signedIn) {
  //       await this.$store.dispatch(`getAllTxs`)
  //     }
  //   },
  //   loadMore() {
  //     this.showing += 10
  //   }
  // },
  apollo: {
    bankTransactions: {
      query: gql`
        query bankTransactions($networkId: String!, $address: String!) {
          bankTransactions(networkId: $networkId, address: $address) {
            type
            hash
            height
            group
            timestamp
            senderAddress
            recipientAddress
            gasUsed
            amount {
              amount
              denom
            }
            fee {
              amount
              denom
            }
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
        if (Array.isArray(result.bankTransactions)) {
          return result.bankTransactions.map(tx => {
            tx.timestamp = new Date(tx.timestamp)
            return tx
          })
        } return []
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
