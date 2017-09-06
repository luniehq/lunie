<template lang="pug">
page(:title='pageTitle')
  modal-search(v-if="filters.candidates.search.visible" type="candidates")
  tool-bar
    a(@click='setSearch(true)'): i.material-icons search
    router-link(v-if="" to='/staking/delegate') Delegate
  panel-sort(:sort='sort')
  card-candidate(
    v-for='i in filteredCandidates'
    key='i.id'
    :candidate='i')
</template>

<script>
import { mapGetters } from 'vuex'
import { includes, orderBy } from 'lodash'
import Mousetrap from 'mousetrap'
import CardCandidate from './CardCandidate'
import Field from '@nylira/vue-field'
import ModalSearch from '../common/ModalSearch'
import Page from '../common/NiPage'
import Part from '../common/NiPart'
import PanelSort from './PanelSort'
import ToolBar from '../common/NiToolBar'
export default {
  name: 'page-candidates',
  components: {
    CardCandidate,
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
        { id: 1, title: 'ID', value: 'keybaseID' },
        { id: 2, title: 'Delegated', value: 'atoms', initial: true }
      ]
      if (this.user.signedIn) {
        props.push({ id: 2, title: 'Delegated (Yours)', value: 'computed.delegatedAtoms' })
      }
      props.push({ id: 3, title: 'Delegators', value: 'computed.delegators' })
      return {
        property: 'atoms',
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
