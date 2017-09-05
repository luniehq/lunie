<template lang="pug">
page(title='Balances')
  modal-search(v-if="filters.balances.search.visible")
  tool-bar
    a(@click='setSearch(true)'): i.material-icons search
  part(title='Your Address')
    list-item(dt="Address" :dd="wallet.key.address")
  part(title="Address Balances")
    list-item(
      v-for="i in filteredBalances"
      :key="i.denom"
      :to="i.denom"
      :dt="i.denom.toUpperCase()"
      :dd="i.amount")
    list-item(v-if='tmpWallet.balances.length === 0' dt="N/A" dd="None Available")
</template>

<script>
import { mapGetters } from 'vuex'
import { includes, orderBy } from 'lodash'
import Mousetrap from 'mousetrap'
import Btn from '@nylira/vue-button'
import ListItem from '../common/NiListItem'
import ModalSearch from '../common/ModalSearchBalances'
import Page from '../common/NiPage'
import Part from '../common/NiPart'
import ToolBar from '../common/NiToolBar'
export default {
  name: 'page-balances',
  components: {
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
      let list = orderBy(this.tmpWallet.balances, ['denom', 'desc'])
      if (this.filters.balances.search.visible) {
        return list.filter(i => includes(i.denom.toLowerCase(), query))
      } else {
        return list
      }
    }
  },
  data: () => ({
    // TODO: the walletTmp data is only for previwing the page design
    // please remove walletTmp for the actual 'wallet' from vuex
    tmpWallet: {
      balances: [
        { denom: 'testcoin', amount: 134234.23423 },
        { denom: 'ethermint', amount: 294.991254545 },
        { denom: 'fakecoin', amount: 105923}
      ]
    }
  }),
  methods: {
    setSearch (v) { this.$store.commit('setBalancesSearchVisible', v) },
  },
  mounted () {
    Mousetrap.bind(['command+f', 'ctrl+f'], () => this.setSearch(true))
    Mousetrap.bind('esc', () => this.setSearch(false))
  }
}
</script>
