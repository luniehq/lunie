<template>
  <tm-page data-title="Wallet"
    ><template slot="menu-body">
      <tm-balance></tm-balance>
      <vm-tool-bar
        ><a
          @click="connected &amp;&amp; updateBalances()"
          v-tooltip.bottom="'Refresh'"
          :disabled="!connected"
          ><i class="material-icons">refresh</i></a
        ><a
          @click="setSearch()"
          v-tooltip.bottom="'Search'"
          :disabled="!somethingToSearch"
          ><i class="material-icons">search</i></a
        ></vm-tool-bar
      >
    </template>
    <modal-search type="balances" v-if="somethingToSearch"></modal-search>
    <tm-data-loading v-if="wallet.loading"></tm-data-loading>
    <tm-data-msg
      id="account_empty_msg"
      v-else-if="wallet.balances.length === 0"
      icon="help_outline"
    >
      <div slot="title">Account empty</div>
      <div slot="subtitle">
        This account doesn't hold any coins yet. Go to the&nbsp;<a
          href="https://gaia.faucetcosmos.network/"
          >token faucet</a
        >&nbsp;to aquire tokens to play with.
      </div>
    </tm-data-msg>
    <data-empty-search
      v-else-if="filteredBalances.length === 0"
    ></data-empty-search>
    <ul>
      <li-coin
        class="tm-li-balance"
        v-for="coin in filteredBalances"
        v-if="wallet.balances.length &gt; 0 &amp;&amp; coin.amount &gt; 0"
        :key="coin.denom"
        :coin="coin"
      ></li-coin>
    </ul>
  </tm-page>
</template>

<script>
import num from "scripts/num"
import { mapGetters, mapActions } from "vuex"
import { includes, orderBy } from "lodash"
import Mousetrap from "mousetrap"
import DataEmptySearch from "common/TmDataEmptySearch"
import LiCopy from "common/TmLiCopy"
import LiCoin from "./LiCoin"
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
    VmToolBar
  },
  data: () => ({ num }),
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
      return !this.wallet.loading && !!this.wallet.balances.length
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
  mounted() {
    Mousetrap.bind([`command+f`, `ctrl+f`], () => this.setSearch(true))
    Mousetrap.bind(`esc`, () => this.setSearch(false))
    this.updateDelegates()
    this.queryWalletState()
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
  }
}
</script>
