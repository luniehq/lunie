<template lang="pug">
tm-page(title='Transactions')
  div(slot="menu"): tool-bar
    a(@click='refreshTransactions()' v-tooltip.bottom="'Refresh'")
      i.material-icons refresh
    a(@click='setSearch()' v-tooltip.bottom="'Search'" :disabled="!somethingToSearch")
      i.material-icons search

  modal-search(type="transactions" v-if="somethingToSearch")

  tm-data-loading(v-if="wallet.historyLoading")
  data-empty-tx(v-else-if='transactions.length === 0')
  data-empty-search(v-else-if="filteredTransactions.length === 0")
  tm-li-transaction(
    v-else
    v-for="i in filteredTransactions"
    :key="shortid.generate()"
    :transaction="i"
    :address="wallet.address")
</template>

<script>
import shortid from "shortid"
import { mapGetters } from "vuex"
import { includes, orderBy } from "lodash"
import Mousetrap from "mousetrap"
import DataEmptySearch from "common/TmDataEmptySearch"
import DataEmptyTx from "common/TmDataEmptyTx"
import ModalSearch from "common/TmModalSearch"
import { TmPage, TmDataLoading, TmLiTransaction } from "@tendermint/ui"
import ToolBar from "common/TmToolBar"
export default {
  name: "page-transactions",
  components: {
    TmLiTransaction,
    TmDataLoading,
    DataEmptySearch,
    DataEmptyTx,
    ModalSearch,
    TmPage,
    ToolBar
  },
  computed: {
    ...mapGetters(["filters", "transactions", "wallet", "config"]),
    somethingToSearch() {
      return !this.wallet.historyLoading && !!this.transactions.length
    },
    orderedTransactions() {
      return orderBy(this.transactions, [this.sort.property], [this.sort.order])
    },
    filteredTransactions() {
      let query = this.filters.transactions.search.query
      if (this.filters.transactions.search.visible) {
        // doing a full text comparison on the transaction data
        return this.orderedTransactions.filter(t =>
          includes(JSON.stringify(t).toLowerCase(), query)
        )
      } else {
        return this.orderedTransactions
      }
    }
  },
  data: () => ({
    shortid: shortid,
    sort: {
      property: "height",
      order: "desc"
    }
  }),
  methods: {
    refreshTransactions() {
      this.$store.dispatch("queryWalletHistory")
    },
    setSearch(bool = !this.filters["transactions"].search.visible) {
      if (!this.somethingToSearch) return false
      this.$store.commit("setSearchVisible", ["transactions", bool])
    }
  },
  mounted() {
    Mousetrap.bind(["command+f", "ctrl+f"], () => this.setSearch(true))
    Mousetrap.bind("esc", () => this.setSearch(false))
  }
}
</script>
