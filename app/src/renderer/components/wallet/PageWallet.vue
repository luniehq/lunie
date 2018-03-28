<template lang="pug">
page(title='Wallet')
  div(slot="menu"): tool-bar
    a(@click='updateBalances()')
      i.material-icons refresh
      .label Refresh
    a(@click='setSearch(true)')
      i.material-icons search
      .label Search

  modal-search(type="balances")

  part(title='Your Address')
    li-copy(:value="wallet.key.address")

  part(title="Denomination Balances")
    data-loading(v-if="wallet.balancesLoading")
    data-empty(v-else-if="wallet.balances.length === 0")
    data-empty-search(v-else-if="filteredBalances.length === 0")
    list-item(
      v-for="i in filteredBalances"
      v-if="wallet.balances.length > 0 && i.amount > 0 && !wallet.balancesLoading"
      :btn="'Send'"
      :key="i.denom"
      :dt="i.denom.toUpperCase()"
      :dd="i.amount"
      :to="{name: 'send', params: {denom: i.denom}}")

  part(title="Network Denominations")
    list-item(
      v-for="i in filteredBalances"
      v-if="i.amount === 0"
      :key="i.denom"
      :dt="i.denom.toUpperCase()")
</template>

<script>
import { mapGetters } from 'vuex'
import { includes, orderBy } from 'lodash'
import Mousetrap from 'mousetrap'
import DataLoading from 'common/NiDataLoading'
import DataEmpty from 'common/NiDataEmpty'
import DataEmptySearch from 'common/NiDataEmptySearch'
import LiCopy from 'common/NiLiCopy'
import ListItem from 'common/NiListItem'
import ModalSearch from 'common/NiModalSearch'
import Page from 'common/NiPage'
import Part from 'common/NiPart'
import ToolBar from 'common/NiToolBar'
export default {
  name: 'page-wallet',
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
    ...mapGetters(['filters', 'wallet']),
    allDenomBalances () {
      // for denoms not in balances, add empty balance
      let balances = this.wallet.balances.slice(0)
      let hasDenom = (denom) => {
        return !!balances.filter((balance) =>
          balance.denom === denom)[0]
      }
      for (let denom of this.wallet.denoms) {
        if (hasDenom(denom)) continue
        balances.push({ denom, amount: 0 })
      }
      return balances
    },
    filteredBalances () {
      let query = this.filters.balances.search.query
      let list = orderBy(this.allDenomBalances, ['amount', 'denom'], ['desc', 'asc'])
      if (this.filters.balances.search.visible) {
        return list.filter(i => includes(i.denom.toLowerCase(), query))
      } else {
        return list
      }
    }
  },
  methods: {
    setSearch (bool) {
      this.$store.commit('setSearchVisible', ['balances', bool])
    },
    updateBalances () {
      this.$store.dispatch('queryWalletState')
    }
  },
  mounted () {
    Mousetrap.bind(['command+f', 'ctrl+f'], () => this.setSearch(true))
    Mousetrap.bind('esc', () => this.setSearch(false))
  }
}
</script>
