<template lang="pug">
tm-page(title='Transactions')
  div(slot="menu"): vm-tool-bar
    a(@click='connected && refreshTransactions()' v-tooltip.bottom="'Refresh'" :disabled="!connected")
      i.material-icons refresh
    a(@click='setSearch()' v-tooltip.bottom="'Search'" :disabled="!somethingToSearch")
      i.material-icons search

  modal-search(type="transactions" v-if="somethingToSearch")

  tm-data-loading(v-if="transactions.loading")
  data-empty-tx(v-else-if='allTransactions.length === 0')
  data-empty-search(v-else-if="filteredTransactions.length === 0")
  template(v-else v-for="(tx, i) in filteredTransactions")
    tm-li-any-transaction(
      :validators="validators"
      :validatorURL='validatorURL'
      :key="shortid.generate()"
      :transaction="tx"
      :address="wallet.address"
      v-on:end-unbonding="endUnbonding(tx)")
</template>

<script>
import shortid from "shortid"
import { mapGetters, mapState } from "vuex"
import { includes, orderBy } from "lodash"
import Mousetrap from "mousetrap"
import DataEmptySearch from "common/TmDataEmptySearch"
import DataEmptyTx from "common/TmDataEmptyTx"
import ModalSearch from "common/TmModalSearch"
import { TmPage, TmDataLoading, TmLiAnyTransaction } from "@tendermint/ui"
import VmToolBar from "common/VmToolBar"
export default {
  name: "page-transactions",
  components: {
    TmLiAnyTransaction,
    TmDataLoading,
    DataEmptySearch,
    DataEmptyTx,
    ModalSearch,
    TmPage,
    VmToolBar
  },
  computed: {
    ...mapState(["transactions", "node"]),
    ...mapGetters([
      "filters",
      "allTransactions",
      "wallet",
      "config",
      "delegation",
      "connected",
      "validators"
    ]),
    somethingToSearch() {
      return !this.transactions.loading && !!this.allTransactions.length
    },
    enrichedTransactions() {
      return this.allTransactions.map(this.enrichUnbondingTransactions)
    },
    orderedTransactions() {
      return orderBy(
        this.enrichedTransactions.map(t => {
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
    },
    validatorURL: "/staking/validators"
  }),
  methods: {
    refreshTransactions() {
      this.$store.dispatch("getAllTxs")
    },
    async endUnbonding(transaction) {
      let validatorAddr = transaction.tx.value.msg[0].value.validator_addr
      await this.$store.dispatch("endUnbonding", validatorAddr)
    },
    enrichUnbondingTransactions(transaction) {
      let copiedTransaction = JSON.parse(JSON.stringify(transaction))
      let type = copiedTransaction.tx.value.msg[0].type
      if (type === "cosmos-sdk/BeginUnbonding") {
        let tx = copiedTransaction.tx.value.msg[0].value
        let unbondingDelegation = this.delegation.unbondingDelegations[
          tx.validator_addr
        ]
        // TODO hack, use creation_height when https://github.com/cosmos/cosmos-sdk/issues/2314 is resolved
        if (
          unbondingDelegation &&
          new Date(unbondingDelegation.min_time).getTime() -
            new Date(copiedTransaction.time).getTime() ===
            0
        )
          copiedTransaction.unbondingDelegation = unbondingDelegation
      }
      return copiedTransaction
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
