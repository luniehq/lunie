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
      <TransactionList
        :transactions="flatOrderedTransactionList"
        :address="session.address"
        :validators="validators"
      />
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
  computed: {
    ...mapState([`session`, `transactions`]),
    ...mapGetters([`validators`, `flatOrderedTransactionList`]),
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
    }
  }
}
</script>
