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
      :unbonding_time="unbondingTime"
      v-on:end-unbonding="endUnbonding(tx)")
</template>

<script>
import shortid from "shortid"
import { mapGetters, mapState } from "vuex"
import { includes, orderBy } from "lodash"
import Mousetrap from "mousetrap"
import moment from "moment"
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
      return this.allTransactions.map(this.setStateOnUnbondingTransactions)
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
    },
    unbondingTime() {
      return "259200000" // 72h TODO get from stake params
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
    endUnbonding(transaction) {
      let validatorAddr = transaction.tx.value.msg[0].value.validator_addr
      this.$store.dispatch("endUnbonding", validatorAddr)
    },
    setStateOnUnbondingTransactions(transaction) {
      let type = transaction.tx.value.msg[0].type
      if (type === "cosmos-sdk/BeginUnbonding") {
        let tx = transaction.tx.value.msg[0].value
        // check if the undelegation is still pending
        if (
          this.delegation.unbondingDelegations[tx.validator_addr] !==
          parseInt(tx.shares_amount)
        ) {
          transaction.state = "ended"
          return transaction
        }
        // check if unbonding period is over
        if (
          moment(transaction.time).valueOf() + parseInt(this.unbondingTime) <=
          Date.now()
        ) {
          transaction.state = "ready"
          return transaction
        }
        transaction.state = "locked"
        return transaction
      }
      return transaction
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
