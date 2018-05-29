<template lang="pug">
page(title='Transactions')
  div(slot="menu"): tool-bar
    a(@click='setSearch()' v-tooltip.bottom="'Search'" :disabled="!somethingToSearch")
      i.material-icons search

  modal-search(type="transactions" v-if="somethingToSearch")

  data-loading(v-if="wallet.historyLoading")
  data-empty-tx(v-else-if='transactions.length === 0')
  data-empty-search(v-else-if="filteredTransactions.length === 0")
  li-transaction(
    v-else
    v-for="i in filteredTransactions"
    :key="shortid.generate()"
    :transaction-value="i"
    :address="wallet.address"
    :devMode="config.devMode")
</template>

<script>
import shortid from "shortid"
import { mapGetters } from "vuex"
import { includes, orderBy, uniqBy } from "lodash"
import Mousetrap from "mousetrap"
import DataLoading from "common/NiDataLoading"
import DataEmptySearch from "common/NiDataEmptySearch"
import DataEmptyTx from "common/NiDataEmptyTx"
import LiTransaction from "wallet/LiTransaction"
import ModalSearch from "common/NiModalSearch"
import Page from "common/NiPage"
import Part from "common/NiPart"
import ToolBar from "common/NiToolBar"
export default {
  name: "page-transactions",
  components: {
    LiTransaction,
    DataLoading,
    DataEmptySearch,
    DataEmptyTx,
    ModalSearch,
    Page,
    Part,
    ToolBar
  },
  computed: {
    ...mapGetters(["filters", "transactions", "wallet", "config"]),
    somethingToSearch() {
      return !this.wallet.historyLoading && !!this.transactions.length
    },
    orderedTransactions() {
      let list = orderBy(
        this.transactions,
        [this.sort.property],
        [this.sort.order]
      )
      return uniqBy(list, "time") // filter out duplicate tx to self
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
      property: "time",
      order: "desc"
    }
  }),
  methods: {
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
