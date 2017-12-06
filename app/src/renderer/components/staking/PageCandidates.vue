<template lang="pug">
page(:title='pageTitle')
  div(slot="menu"): tool-bar
    a(@click='setSearch(true)')
      i.material-icons search
      .label Search
    router-link(to='/staking/delegate')
      i.material-icons check_circle
      .label Delegate
  modal-search(v-if="filters.candidates.search.visible" type="candidates")
  template(v-if="filteredCandidates.length > 0")
    panel-sort(:sort='sort')
    card-candidate(
      v-for='i in filteredCandidates'
      key='i.id'
      :candidate='i')
  data-error(v-else)
</template>

<script>
import { mapGetters } from 'vuex'
import { includes, orderBy } from 'lodash'
import Mousetrap from 'mousetrap'
import CardCandidate from 'staking/CardCandidate'
import DataError from 'common/NiDataError'
import Field from '@nylira/vue-field'
import ModalSearch from 'common/NiModalSearch'
import Page from 'common/NiPage'
import Part from 'common/NiPart'
import PanelSort from 'staking/PanelSort'
import ToolBar from 'common/NiToolBar'
export default {
  name: 'page-candidates',
  components: {
    CardCandidate,
    DataError,
    Field,
    ModalSearch,
    Page,
    Part,
    PanelSort,
    ToolBar
  },
  computed: {
    ...mapGetters(['candidates', 'filters', 'shoppingCart']),
    pageTitle () {
      return `Delegates (${this.candidatesNum} Candidates Selected)`
    },
    filteredCandidates () {
      let query = this.filters.candidates.search.query
      let list = orderBy(this.candidates, [this.sort.property], [this.sort.order])
      if (this.filters.candidates.search.visible) {
        return list.filter(i => includes(i.keybaseID.toLowerCase(), query.toLowerCase()))
      } else {
        return list
      }
    },
    candidatesNum () { return this.shoppingCart.length }
  },
  data: () => ({
    query: '',
    sort: {
      property: 'keybaseID',
      order: 'asc',
      properties: [
        { id: 1, title: 'Keybase ID', value: 'keybaseID', initial: true },
        { id: 2, title: 'Country', value: 'country' },
        { id: 3, title: 'Voting Power', value: 'voting_power' },
        { id: 4, title: 'Delegated Power', value: 'shares' },
        { id: 5, title: 'Commission', value: 'commission' }
      ]
    }
  }),
  methods: {
    setSearch (bool) { this.$store.commit('setSearchVisible', ['candidates', bool]) }
  },
  mounted () {
    Mousetrap.bind(['command+f', 'ctrl+f'], () => this.setSearch(true))
    Mousetrap.bind('esc', () => this.setSearch(false))
  }
}
</script>
