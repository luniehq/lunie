<template lang="pug">
page(:title='pageTitle')
  div(slot="menu"): tool-bar
    a(@click='setSearch(true)')
      i.material-icons search
      .label Search
    router-link(v-if="" to='/staking/delegate')
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
    ...mapGetters(['candidates', 'filters', 'shoppingCart', 'user']),
    pageTitle () {
      if (this.user.signedIn) return `Candidates (${this.candidatesNum} Selected)`
      else return 'Candidates'
    },
    filteredCandidates () {
      let query = this.filters.candidates.search.query
      let list = orderBy(this.candidates, [this.sort.property], [this.sort.order])
      if (this.filters.candidates.search.visible) {
        return list.filter(i => includes(i.keybaseID.toLowerCase(), query))
      } else {
        return list
      }
    },
    candidatesNum () {
      return this.shoppingCart.length
    },
    sort () {
      let props = [
        { id: 1, title: 'Keybase ID', value: 'keybaseID' },
        { id: 2, title: 'Public Key', value: 'id' },
        { id: 3, title: 'Delegated', value: 'voting_power', initial: true }
      ]
      if (this.user.signedIn) {
        props.push({ id: 4, title: 'Delegated (Yours)', value: 'delegated' })
      }
      return {
        property: 'voting_power',
        order: 'desc',
        properties: props
      }
    }
  },
  data: () => ({
    query: ''
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
