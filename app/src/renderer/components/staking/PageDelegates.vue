<template lang="pug">
page#page-delegates(title='Delegates')
  div(slot="menu"): tool-bar
    a(@click='setSearch(true)')
      i.material-icons search
      .label Search
    a(@click='updateDelegates(address)')
      i.material-icons refresh
      .label Refresh

  modal-search(type="delegates")

  .delegates-container
    data-loading(v-if="delegates.length === 0")
    data-empty-search(v-else-if="filteredDelegates.length === 0")
    template(v-else)
      panel-sort(:sort='sort')
      li-delegate(v-for='i in filteredDelegates' :key='i.id' :delegate='i')

  .fixed-button-bar
    .label #[strong {{ shoppingCart.length }}] delegates selected
    btn.btn__primary(type="link" to="/staking/bond" :disabled="shoppingCart.length < 1" icon="chevron_right" icon-pos="right" value="Next")
</template>

<script>
import { mapGetters } from 'vuex'
import { includes, orderBy } from 'lodash'
import Mousetrap from 'mousetrap'
import LiDelegate from 'staking/LiDelegate'
import Btn from '@nylira/vue-button'
import DataEmptySearch from 'common/NiDataEmptySearch'
import DataLoading from 'common/NiDataLoading'
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
    DataLoading,
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
        { id: 1, title: 'Name', value: 'description.moniker', class: 'name' },
        { id: 2, title: '% of Vote', value: 'shares', class: 'percent_of_vote' },
        { id: 3, title: '# of Votes', value: 'voting_power', class: 'number_of_votes' },
        { id: 4, title: 'Bonded by You', value: 'bonded', class: 'bonded_by_you' }
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

.delegates-container
  flex 1

.fixed-button-bar
  width 100%
  padding 1rem
  background app-fg
  display flex
  justify-content space-between
  .label
    color bright
    line-height 2rem
    strong
      font-weight bold
</style>
