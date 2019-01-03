<template>
  <tm-page data-title="Wallet">
    <template slot="menu-body">
      <tm-balance />
      <tool-bar>
        <a
          v-tooltip.bottom="'Refresh'"
          :disabled="!connected"
          @click="connected && queryWalletBalances()"
        >
          <i class="material-icons">refresh</i>
        </a>
        <a
          v-tooltip.bottom="'Search'"
          :disabled="!somethingToSearch"
          @click="setSearch()"
        >
          <i class="material-icons">search</i>
        </a>
      </tool-bar>
    </template>
    <managed-body
      :connected="connected"
      :loading="wallet.loading"
      :loaded="wallet.loaded"
      :error="wallet.error"
      :data="wallet.balances"
      :filtered-data="filteredBalances"
      :search="{ somethingToSearch: somethingToSearch, type: `balances` }"
    >
      <tm-data-msg id="account_empty_msg" slot="no-data" icon="help_outline">
        <div slot="title">Account empty</div>
        <div slot="subtitle">
          This account doesn't hold any coins yet. Go to the&nbsp;
          <a href="https://gaia.faucetcosmos.network/">token faucet</a> &nbsp;to
          aquire tokens to play with.
        </div>
      </tm-data-msg>
      <ul slot="data-body">
        <li-coin
          v-for="coin in filteredBalances"
          v-if="wallet.balances.length > 0 && coin.amount > 0"
          :key="coin.denom"
          :coin="coin"
          class="tm-li-balance"
        />
      </ul>
    </managed-body>
  </tm-page>
</template>

<script>
import num from "scripts/num"
import { mapGetters, mapActions } from "vuex"
import { includes, orderBy } from "lodash"
import Mousetrap from "mousetrap"
import DataEmptySearch from "common/TmDataEmptySearch"
import TmDataConnecting from "common/TmDataConnecting"
import LiCopy from "common/TmLiCopy"
import LiCoin from "./LiCoin"
import TmListItem from "common/TmListItem"
import TmPage from "common/TmPage"
import TmPart from "common/TmPart"
import TmDataLoading from "common/TmDataLoading"
import TmDataMsg from "common/TmDataMsg"
import TmBalance from "common/TmBalance"
import ModalSearch from "common/TmModalSearch"
import ToolBar from "common/ToolBar"
import ManagedBody from "../common/ManagedBody"
export default {
  name: `page-wallet`,
  components: {
    ManagedBody,
    TmBalance,
    TmDataLoading,
    TmDataMsg,
    DataEmptySearch,
    TmDataConnecting,
    LiCoin,
    LiCopy,
    TmListItem,
    ModalSearch,
    TmPage,
    TmPart,
    ToolBar
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
        return list.filter(coin =>
          includes(JSON.stringify(coin).toLowerCase(), query.toLowerCase())
        )
      } else {
        return list
      }
    }
  },
  mounted() {
    Mousetrap.bind([`command+f`, `ctrl+f`], () => this.setSearch(true))
    Mousetrap.bind(`esc`, () => this.setSearch(false))
    this.updateDelegates()
    this.queryWalletBalances()
  },
  methods: {
    ...mapActions([`updateDelegates`, `queryWalletBalances`]),
    setSearch(bool = !this.filters[`balances`].search.visible) {
      if (!this.somethingToSearch) return false
      this.$store.commit(`setSearchVisible`, [`balances`, bool])
    }
  }
}
</script>
