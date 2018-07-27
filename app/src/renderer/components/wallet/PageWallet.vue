<template lang="pug">
tm-page(title='Wallet')
  div(slot="menu")
    tm-tool-bar
      a(@click='updateBalances()' v-tooltip.bottom="'Refresh'")
        i.material-icons refresh
      a(@click='setSearch()' v-tooltip.bottom="'Search'" :disabled="!somethingToSearch")
        i.material-icons search

  modal-search(type="balances" v-if="somethingToSearch")

  tm-part(title='Your Address')
    tm-list-item(
      :title="wallet.address"
      :btn="'Receive'"
      :overflow="true"
      @click.native="copy")
      btn-receive(slot="btn-receive")

  tm-part#part-available-balances(title="Available Balances")
    tm-data-loading(v-if="wallet.balancesLoading")
    tm-data-msg(id="account_empty_msg" v-else-if="wallet.balances.length === 0" icon="help_outline")
      div(slot="title") Account empty
      div(slot="subtitle") 
        | This account doesn't hold any coins yet. Go to the 
        a(href="https://gaia.faucetcosmos.network/") token faucet
        | &nbsp;to aquire tokens to play with.
    data-empty-search(v-else-if="filteredBalances.length === 0")
    tm-list-item.tm-li-balance(
      v-for="i in filteredBalances"
      v-if="wallet.balances.length > 0 && i.amount > 0"
      :btn="'Send'"
      :key="i.denom"
      :dt="i.denom.toUpperCase()"
      :dd="i.amount"
      :to="{name: 'send', params: {denom: i.denom}}")

  tm-part#part-staked-balances(v-if="config.devMode" title="Staked Balances")
    tm-list-item(
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
import DataEmptySearch from "common/TmDataEmptySearch"
import LiCopy from "common/TmLiCopy"
import BtnReceive from "common/TmBtnReceive"
import {
  TmListItem,
  TmPage,
  TmPart,
  TmDataLoading,
  TmDataMsg
} from "@tendermint/ui"
import ModalSearch from "common/TmModalSearch"
import TmToolBar from "common/TmToolBar"
export default {
  name: "page-wallet",
  components: {
    TmDataLoading,
    TmDataMsg,
    DataEmptySearch,
    LiCopy,
    TmListItem,
    ModalSearch,
    TmPage,
    TmPart,
    TmToolBar,
    BtnReceive
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
    this.$store.dispatch("updateDelegates")
  }
}
</script>

<style lang="stylus">
main
  .tm-li-label
    max-width calc(100% - 110px)

  .tm-li-title
    white-space nowrap
    overflow hidden
    text-overflow ellipsis
    width 100%
</style>
