<template lang="pug">
page(title='Transactions')
  div(slot="menu"): tool-bar
    a(@click='setSearch(true)')
      i.material-icons search
      .label Search

  modal-search(v-if="filters.transactions.search.visible" type="transactions")

  card-transaction(
    v-for="i in filteredTransactions"
    :transaction-value="i"
    :address="wallet.key.address")
  data-empty-tx(v-if='filteredTransactions.length === 0')
</template>

<script>
import { mapGetters } from 'vuex'
// import { includes, orderBy } from 'lodash'
import Mousetrap from 'mousetrap'
import AnchorCopy from 'common/AnchorCopy'
import Btn from '@nylira/vue-button'
import DataEmptyTx from 'common/NiDataEmptyTx'
import ListItem from 'common/NiListItem'
import CardTransaction from 'wallet/CardTransaction'
import ModalSearch from 'common/NiModalSearch'
import Page from 'common/NiPage'
import Part from 'common/NiPart'
import ToolBar from 'common/NiToolBar'
export default {
  name: 'page-transactions',
  components: {
    AnchorCopy,
    Btn,
    CardTransaction,
    DataEmptyTx,
    ListItem,
    ModalSearch,
    Page,
    Part,
    ToolBar
  },
  computed: {
    ...mapGetters(['filters', 'transactions', 'wallet']),
    filteredTransactions () {
      return this.transactions
      // TODO: restore searchability? (what part of the tx are we searching?)
    }
  },
  methods: {
    setSearch (bool) {
      this.$store.commit('setSearchVisible', ['transactions', bool])
    }
  },
  mounted () {
    Mousetrap.bind(['command+f', 'ctrl+f'], () => this.setSearch(true))
    Mousetrap.bind('esc', () => this.setSearch(false))
  }
}
</script>
