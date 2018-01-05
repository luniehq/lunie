<template lang="pug">
page(title='Delegates')
  div(slot="menu"): tool-bar
    a(@click='setSearch(true)')
      i.material-icons search
      .label Search
    a(@click='updateDelegates(address)')
      i.material-icons refresh
      .label Refresh

  modal-search(type="delegates")

  data-error(v-if="delegates.length === 0")
  data-empty-search(v-else-if="filteredDelegates.length === 0")

  template(v-else)
    div.action-container
      h3 You've selected {{ shoppingCart.length }} delegates.
      router-link(to="/staking/bond" v-if="shoppingCart.length") Proceed to the bonding page to allocate your Atoms.
    panel-sort(:sort='sort')
    li-delegate(v-for='i in filteredDelegates' :key='i.id' :delegate='i')
</template>

<script>
import { mapGetters } from 'vuex'
import { includes, orderBy } from 'lodash'
import Mousetrap from 'mousetrap'
import LiDelegate from 'staking/LiDelegate'
import Btn from '@nylira/vue-button'
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
    Btn,
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
      property: 'shares',
      order: 'desc',
      properties: [
        { id: 0, title: '', value: '' },
        { id: 1, title: 'Name', value: 'description.moniker' },
        { id: 2, title: 'Public Key', value: 'id' },
        { id: 3, title: 'Voting Power', value: 'shares', initial: true },
        { id: 4, title: 'Bonded Atoms', value: 'voting_power' },
        { id: 5, title: 'Bonded by You', value: 'bonded' }
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
<style lang="stylus">
@require '~variables'

.action-container
  padding 0 0 1rem 1rem
  height 4rem
</style>
