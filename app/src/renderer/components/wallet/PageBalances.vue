<template lang="pug">
page(title='Balance')
  div(slot="menu"): tool-bar
    a(@click='updateBalances()')
      i.material-icons refresh
      .label Refresh
    a(@click='setSearch(true)')
      i.material-icons search
      .label Search

  modal-search(v-if="filters.balances.search.visible" type="balances")

  part(title='Your Address')
    li-copy(:value="wallet.key.address")

  part(title="Denomination Balances")
    list-item(
      v-for="i in filteredBalances"
      :key="i.denom"
      :dt="i.denom.toUpperCase()"
      :dd="i.amount")
    list-item(v-if='wallet.balances.length === 0' dt="N/A" dd="None Available")
</template>

<script>
import { mapGetters } from 'vuex'
import { includes, orderBy } from 'lodash'
import Mousetrap from 'mousetrap'
import LiCopy from 'common/NiLiCopy'
import ListItem from 'common/NiListItem'
import ModalSearch from 'common/NiModalSearch'
import Page from 'common/NiPage'
import Part from 'common/NiPart'
import ToolBar from 'common/NiToolBar'
export default {
  name: 'page-balances',
  components: {
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
