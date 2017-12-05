<template lang="pug">
page(title='Balance')
  div(slot="menu"): tool-bar
    a(@click.native='updateBalances()')
      i.material-icons refresh
      .label Refresh
    anchor-copy(:value="wallet.key.address" icon="content_copy" label="Copy")
    a(@click='setSearch(true)')
      i.material-icons search
      .label Search

  modal-search(v-if="filters.balances.search.visible" type="balances")

  part(title='Your Address')
    list-item(dt="Address" :dd="wallet.key.address")

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
import AnchorCopy from 'common/AnchorCopy'
import Btn from '@nylira/vue-button'
import ListItem from 'common/NiListItem'
import ModalSearch from 'common/NiModalSearch'
import Page from 'common/NiPage'
import Part from 'common/NiPart'
import ToolBar from 'common/NiToolBar'
export default {
  name: 'page-balances',
  components: {
    AnchorCopy,
    Btn,
    ListItem,
    ModalSearch,
    Page,
    Part,
    ToolBar
  },
  computed: {
    ...mapGetters(['filters', 'wallet']),
    filteredBalances () {
      let query = this.filters.balances.search.query
      let list = orderBy(this.wallet.balances, ['denom'], ['desc'])
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
