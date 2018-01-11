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
    div.delegate-container
      panel-sort(:sort='sort')
      li-delegate(v-for='i in filteredDelegates' key='i.id' :delegate='i')

  div.fixed-button-bar
    h3 {{ shoppingCart.length }} selected
    btn(type="link" to="/staking/bond" :disabled="shoppingCart.length < 1" icon="chevron_right" icon-pos="right" value="Next")
</template>

<script>
import { mapGetters } from 'vuex'
import { includes, orderBy, shuffle } from 'lodash'
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
        return shuffle(list)
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
        { id: 1, title: 'Name', value: 'description.moniker', class: 'name' },
        { id: 2, title: 'Public Key', value: 'id', class: 'id' },
        { id: 3, title: '% of Vote', value: 'shares', class: 'percent_of_vote' },
        { id: 4, title: '# of Votes', value: 'voting_power', class: 'number_of_votes' },
        { id: 5, title: 'Bonded by You', value: 'bonded', class: 'bonded_by_you' }
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
  padding 1rem 0 1rem 1rem
  min-height 5rem

.fixed-button-bar
  position absolute
  width 100%
  background app-bg
  bottom calc(3rem + 1px)
  left 0
  bottom 0
  padding 1rem
  display flex
  justify-content space-between
  border-top 1px solid bc

@media screen and (max-width: 768px)
  .delegate-container
    padding 0.5rem

  .li-delegate__value
    &.id
      display none
</style>
