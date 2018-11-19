<template lang="pug">
tm-page(data-title="Wallet")
  template(slot="menu-body")
    tm-balance
    vm-tool-bar
      a(@click='connected && updateBalances()' v-tooltip.bottom="'Refresh'" :disabled="!connected")
        i.material-icons refresh
      a(@click='setSearch()' v-tooltip.bottom="'Search'" :disabled="!somethingToSearch")
        i.material-icons search

  modal-search(type="balances" v-if="somethingToSearch")

  tm-part(title='Your Address')
    tm-list-item(
      :title="wallet.address"
      :btn="'Receive'"
      :overflow="true")

      btn-receive(slot="btn-receive")

  tm-part#part-available-balances(title="Available Balances")
    tm-data-loading(v-if="wallet.balancesLoading")
    tm-data-msg(id="account_empty_msg" v-else-if="wallet.balances.length === 0" icon="help_outline")
      div(slot="title") Account empty
      div(slot="subtitle")
        | This account doesn't hold any coins yet. Go to the&nbsp;
        a(href="https://gaia.faucetcosmos.network/") token faucet
        | &nbsp;to aquire tokens to play with.
    data-empty-search(v-else-if="filteredBalances.length === 0")
    li-coin.tm-li-balance(
      v-for="i in filteredBalances"
      v-if="wallet.balances.length > 0 && i.amount > 0"
      :key="i.denom"
      :coin="i"
      )
</template>

<script>
import num from "scripts/num"
import { mapGetters, mapActions } from "vuex"
import { includes, orderBy } from "lodash"
import Mousetrap from "mousetrap"
import DataEmptySearch from "common/TmDataEmptySearch"
import LiCopy from "common/TmLiCopy"
import LiCoin from "./LiCoin"
import BtnReceive from "common/TmBtnReceive"
import {
  TmListItem,
  TmPage,
  TmPart,
  TmDataLoading,
  TmDataMsg
} from "@tendermint/ui"
import TmBalance from "common/TmBalance"
import ModalSearch from "common/TmModalSearch"
import VmToolBar from "common/VmToolBar"
export default {
  name: `page-wallet`,
  data: () => ({ num }),
  components: {
    TmBalance,
    TmDataLoading,
    TmDataMsg,
    DataEmptySearch,
    LiCoin,
    LiCopy,
    TmListItem,
    ModalSearch,
    TmPage,
    TmPart,
    VmToolBar,
    BtnReceive
  },
  computed: {
    ...mapGetters([
      `filters`,
      `wallet`,
      `committedDelegations`,
      `oldBondedAtoms`,
      `config`,
      `connected`
    ]),
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
        [`amount`, `denom`],
        [`desc`, `asc`]
      )
      if (this.filters.balances.search.visible) {
        return list.filter(coin => includes(coin.denom.toLowerCase(), query))
      } else {
        return list
      }
    }
  },
  methods: {
    ...mapActions([`updateDelegates`, `queryWalletState`]),
    setSearch(bool = !this.filters[`balances`].search.visible) {
      if (!this.somethingToSearch) return false
      this.$store.commit(`setSearchVisible`, [`balances`, bool])
    },
    updateBalances() {
      this.queryWalletState()
    }
  },
  mounted() {
    Mousetrap.bind([`command+f`, `ctrl+f`], () => this.setSearch(true))
    Mousetrap.bind(`esc`, () => this.setSearch(false))
    this.updateDelegates()
    this.queryWalletState()
  }
}
</script>

<style lang="stylus">
@require '~variables'

@media screen and (min-width: 640px)
  #validator-profile .tm-part-main
    display flex
    flex-flow row-reverse nowrap

    .list-items
      flex 1
</style>
