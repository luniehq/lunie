<template>
  <TmPage
    :managed="true"
    :loading="transactions.loading"
    :loaded="transactions.loaded"
    :error="!!transactions.error"
    :data-empty="dataEmpty"
    data-title="Transactions"
    :sign-in-required="true"
    :hide-header="true"
  >
    <DataEmptyTx slot="no-data" />
    <template slot="managed-body">
      <div v-infinite-scroll="loadMore" infinite-scroll-distance="80">
        <TransactionList
          :transactions="showingTransactions"
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

export default {
  name: `page-transactions`,
  components: {
    TransactionList,
    DataEmptyTx,
    TmPage
  },
  data: () => ({
    showing: 15,
    validators: []
  }),
  computed: {
    ...mapState([`session`, `transactions`]),
    ...mapState({ network: state => state.connection.network }),
    ...mapGetters([`flatOrderedTransactionList`]),
    validatorsAddressMap() {
      const names = {}
      this.validators.forEach(item => {
        names[item.operator_address] = item
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
  watch: {
    "session.signedIn": function() {
      this.refreshTransactions()
    }
  },
  created() {
    this.refreshTransactions()
  },
  methods: {
    async refreshTransactions() {
      if (this.session.signedIn) {
        await this.$store.dispatch(`getAllTxs`)
      }
    },
    loadMore() {
      this.showing += 10
    }
  },
  apollo: {
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
