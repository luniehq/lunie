<template lang="pug">
page(:title='pageTitle')
  div(slot="menu"): tool-bar
    a(@click='setSearch(true)')
      i.material-icons search
      .label Search
    a(@click='updateDelegates(address)')
      i.material-icons refresh
      .label Refresh
    router-link(v-if="config.devMode" to='/staking/bond')
      i.material-icons check_circle
      .label Bond Atoms

  modal-search(type="delegates")

  data-error(v-if="delegates.length === 0")
  data-empty-search(v-else-if="filteredDelegates.length === 0")
  template(v-else)
    panel-sort(:sort='sort')
    li-delegate( v-for='i in filteredDelegates' key='i.id' :delegate='i')
</template>

<script>
import { mapGetters } from 'vuex'
import { includes, orderBy } from 'lodash'
import Mousetrap from 'mousetrap'
import LiDelegate from 'staking/LiDelegate'
import DataEmptySearch from 'common/NiDataEmptySearch'
import DataError from 'common/NiDataError'
import Field from '@nylira/vue-field'
import ModalSearch from 'common/NiModalSearch'
import Page from 'common/NiPage'
import Part from 'common/NiPart'
import PanelSort from 'staking/PanelSort'
import ToolBar from 'common/NiToolBar'
export default {
  name: 'page-delegates',
  components: {
    LiDelegate,
    DataEmptySearch,
    DataError,
    Field,
    ModalSearch,
    Page,
    Part,
    PanelSort,
    ToolBar
  },
  computed: {
    ...mapGetters(['delegates', 'filters', 'shoppingCart', 'config', 'user']),
    address () { return this.user.address },
    pageTitle () {
      if (this.shoppingCart.length > 0) {
        return `Delegates (${this.shoppingCart.length} Selected)`
      } else {
        return 'Delegates'
      }
    },
    filteredDelegates () {
      let query = this.filters.delegates.search.query
      let list = orderBy(this.delegates, [this.sort.property], [this.sort.order])
      if (this.filters.delegates.search.visible) {
        return list.filter(i => includes(JSON.stringify(i).toLowerCase(), query.toLowerCase()))
      } else {
        return list
      }
    }
  },
  data: () => ({
    query: '',
    sort: {
      property: 'id',
      order: 'desc',
      properties: [
        { id: 1, title: 'Name', value: 'description.moniker' },
        { id: 2, title: 'Public Key', value: 'id' },
        { id: 3, title: 'Bonded Atoms', value: 'voting_power' },
        { id: 4, title: 'Voting Power', value: 'shares', initial: true },
        { id: 5, title: 'Commission', value: 'commission' }
      ]
    }
  }),
  watch: {
    address: function (address) {
      address && this.updateDelegates(address)
    }
  },
  methods: {
    async updateDelegates (address) {
      let candidates = await this.$store.dispatch('getDelegates')
      this.$store.dispatch('getBondedDelegates', {candidates, address})
    },
    setSearch (bool) { this.$store.commit('setSearchVisible', ['delegates', bool]) }
  },
  mounted () {
    Mousetrap.bind(['command+f', 'ctrl+f'], () => this.setSearch(true))
    Mousetrap.bind('esc', () => this.setSearch(false))
    this.updateDelegates(this.user.address)
  }
}
</script>
