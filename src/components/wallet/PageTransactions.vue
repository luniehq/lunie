<template>
  <TmPage
    :managed="true"
    :loading="transactions.loading"
    :loaded="transactions.loaded"
    :error="transactions.error"
    :data-empty="dataEmpty"
    data-title="Transactions"
    :sign-in-required="true"
  >
    <DataEmptyTx slot="no-data" />
    <template slot="managed-body">
      <div v-infinite-scroll="loadMore" infinite-scroll-distance="80">
        <TransactionList
          :transactions="showingTransactions"
          :address="session.address"
          :validators="validators"
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
import TransactionList from "../transactions/TransactionList"

export default {
  name: `page-transactions`,
  components: {
    TransactionList,
    DataEmptyTx,
    TmPage
  },
  data: () => ({
    showing: 15
  }),
  computed: {
    ...mapState([`session`, `transactions`]),
    ...mapGetters([`validators`, `flatOrderedTransactionList`]),
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
  }
}
</script>
