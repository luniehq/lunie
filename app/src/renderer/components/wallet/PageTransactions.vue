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
  template(v-else v-for="i in filteredTransactions")
    tm-li-transaction(
      v-if="i.type === 'wallet'"
      :key="shortid.generate()"
      :transaction="i"
      :address="wallet.address")
    tm-li-staking-transaction(
      v-if="i.type === 'staking'"
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
import { TmPage, TmDataLoading } from "@tendermint/ui"
import TmLiTransaction from "./TmLiTransaction"
import TmLiStakingTransaction from "./TmLiStakingTransaction"
import ToolBar from "common/TmToolBar"
export default {
  name: "page-transactions",
  components: {
    TmLiTransaction,
    TmLiStakingTransaction,
    TmDataLoading,
    DataEmptySearch,
    DataEmptyTx,
    ModalSearch,
    TmPage,
    ToolBar
  },
  computed: {
    ...mapGetters([
      "filters",
      "transactions",
      "wallet",
      "config",
      "delegation"
    ]),
    somethingToSearch() {
      return !this.wallet.historyLoading && !!this.transactions.length
    },
    allTransactions() {
      return [].concat(
        this.transactions.map(t => {
          t.type = "wallet"
          return t
        }),
        this.delegation.delegationTxs.map(t => {
          t.type = "staking"
          return t
        })
      )
    },
    orderedTransactions() {
      return orderBy(
        this.allTransactions.map(t => {
          t.height = parseInt(t.height)
          return t // TODO what happens if block height is bigger then int?
        }),
        [this.sort.property],
        [this.sort.order]
      )
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
      this.$store.dispatch("getDelegationTxs")
    },
    setSearch(bool = !this.filters["transactions"].search.visible) {
      if (!this.somethingToSearch) return false
      this.$store.commit("setSearchVisible", ["transactions", bool])
    }
  },
  mounted() {
    Mousetrap.bind(["command+f", "ctrl+f"], () => this.setSearch(true))
    Mousetrap.bind("esc", () => this.setSearch(false))
    this.refreshTransactions()
  }
}
</script>
