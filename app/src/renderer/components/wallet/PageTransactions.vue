<template lang="pug">
page(title='Transactions')
  div(slot="menu"): tool-bar
    a(@click='setSearch(true)')
      i.material-icons search
      .label Search

  modal-search(v-if="filters.transactions.search.visible" type="transactions")

  data-empty-tx(v-if='transactions.length === 0')
  data-empty-search(v-else-if="filteredTransactions.length")
  li-transaction(
    v-else
    v-for="i in filteredTransactions"
    :transaction-value="i"
    :address="wallet.key.address"
    :devMode="config.devMode")
</template>

<script>
import { mapGetters } from 'vuex'
import { includes, orderBy } from 'lodash'
import Mousetrap from 'mousetrap'
import DataEmptySearch from 'common/NiDataEmptySearch'
import DataEmptyTx from 'common/NiDataEmptyTx'
import LiTransaction from 'wallet/LiTransaction'
import ModalSearch from 'common/NiModalSearch'
import Page from 'common/NiPage'
import Part from 'common/NiPart'
import ToolBar from 'common/NiToolBar'
export default {
  name: 'page-transactions',
  components: {
    LiTransaction,
    DataEmptySearch,
    DataEmptyTx,
    ModalSearch,
    Page,
    Part,
    ToolBar
  },
  computed: {
    ...mapGetters(['filters', 'transactions', 'wallet', 'config']),
    orderedTransactions () {
      return orderBy(this.transactions, [this.sort.property], [this.sort.order])
    },
    filteredTransactions () {
      let query = this.filters.transactions.search.query
      if (this.filters.transactions.search.visible) {
        // doing a full text comparison on the transaction data
        return this.orderedTransactions.filter(t => includes(JSON.stringify(t).toLowerCase(), query))
      } else {
        return this.orderedTransactions
      }
    }
  },
  data: () => ({
    sort: {
      property: 'time',
      order: 'desc'
    }
  }),
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
