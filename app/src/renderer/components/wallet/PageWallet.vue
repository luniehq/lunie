<template lang="pug">
page(title='Wallet')
  div(slot="menu"): tool-bar
    a(@click='updateBalances()' v-tooltip.bottom="'Refresh'")
      i.material-icons refresh
    a(@click='setSearch()' v-tooltip.bottom="'Search'" :disabled="!somethingToSearch")
      i.material-icons search

  modal-search(type="balances" v-if="somethingToSearch")

  part(title='Your Address')
    list-item(
      :title="wallet.address"
      :btn="'Receive'"
      :overflow="true"
      @click.native="copy")

  part#part-available-balances(title="Available Balances")
    data-loading(v-if="wallet.balancesLoading")
    data-empty(v-else-if="wallet.balances.length === 0")
    data-empty-search(v-else-if="filteredBalances.length === 0")
    list-item.ni-li-balance(
      v-for="i in filteredBalances"
      v-if="wallet.balances.length > 0 && i.amount > 0"
      :btn="'Send'"
      :key="i.denom"
      :dt="i.denom.toUpperCase()"
      :dd="i.amount"
      :to="{name: 'send', params: {denom: i.denom}}")

  part#part-staked-balances(v-if="config.devMode" title="Staked Balances")
    list-item(
      btn="Stake"
      :dt="stakingDenom"
      :dd="stakedTokens"
      :to="{name: 'staking'}")
</template>

<script>
import { mapGetters } from "vuex"
import { clipboard } from "electron"
import { sum, includes, orderBy } from "lodash"
import Mousetrap from "mousetrap"
import DataLoading from "common/NiDataLoading"
import DataEmpty from "common/NiDataEmpty"
import DataEmptySearch from "common/NiDataEmptySearch"
import LiCopy from "common/NiLiCopy"
import ListItem from "common/NiListItem"
import ModalSearch from "common/NiModalSearch"
import Page from "common/NiPage"
import Part from "common/NiPart"
import ToolBar from "common/NiToolBar"
export default {
  name: "page-wallet",
  components: {
    DataLoading,
    DataEmpty,
    DataEmptySearch,
    LiCopy,
    ListItem,
    ModalSearch,
    Page,
    Part,
    ToolBar
  },
  computed: {
    ...mapGetters(["filters", "wallet", "committedDelegations", "config"]),
    somethingToSearch() {
      return !this.wallet.balancesLoading && !!this.wallet.balances.length
    },
    allDenomBalances() {
      // for denoms not in balances, add empty balance
      let balances = this.wallet.balances.slice(0)
      let hasDenom = denom => {
        return !!balances.filter(balance => balance.denom === denom)[0]
      }
      for (let denom of this.wallet.denoms) {
        if (hasDenom(denom)) continue
        balances.push({ denom, amount: 0 })
      }
      return balances
    },
    filteredBalances() {
      let query = this.filters.balances.search.query
      let list = orderBy(
        this.allDenomBalances,
        ["amount", "denom"],
        ["desc", "asc"]
      )
      if (this.filters.balances.search.visible) {
        return list.filter(i => includes(i.denom.toLowerCase(), query))
      } else {
        return list
      }
    },
    stakedTokens() {
      return sum(Object.values(this.committedDelegations))
    },
    stakingDenom() {
      return this.config.bondingDenom.toUpperCase()
    }
  },
  methods: {
    setSearch(bool = !this.filters["balances"].search.visible) {
      if (!this.somethingToSearch) return false
      this.$store.commit("setSearchVisible", ["balances", bool])
    },
    updateBalances() {
      this.$store.dispatch("queryWalletState")
    },
    copy() {
      clipboard.writeText(this.wallet.address)

      this.$store.commit("notify", {
        title: "Copied your address to clipboard.",
        body:
          "You can receive Cosmos tokens of any denomination by sharing this address."
      })
    }
  },
  mounted() {
    Mousetrap.bind(["command+f", "ctrl+f"], () => this.setSearch(true))
    Mousetrap.bind("esc", () => this.setSearch(false))
  }
}
</script>
