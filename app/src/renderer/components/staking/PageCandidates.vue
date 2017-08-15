<template lang="pug">
page(:title='pageTitle')
  tool-bar
    a(@click='toggleSearch'): i.material-icons search
    // TODO: Fix Filter
    // field(theme='cosmos', type='text', placeholder='Filter...', v-model='query')
    router-link(v-if="user.signedIn && candidatesNum > 0" to='/delegate') Delegate
    a(@click='toggleFilter'): i.material-icons filter_list
  part(title='All Candidates')
    panel-sort(:sort='sort')
    card-candidate(
      v-for='candidate in filteredCandidates'
      key='candidate.id'
      :candidate='candidate')
</template>

<script>
import { mapGetters } from 'vuex'
import { orderBy, includes } from 'lodash'
import CardCandidate from './CardCandidate'
import Field from '@nylira/vue-field'
import Page from '../common/NiPage'
import Part from '../common/NiPart'
import PanelSort from './PanelSort'
import ToolBar from '../common/NiToolBar'
export default {
  name: 'page-candidates',
  components: {
    CardCandidate,
    Field,
    Page,
    Part,
    PanelSort,
    ToolBar
  },
  computed: {
    ...mapGetters(['candidates', 'shoppingCart', 'user']),
    pageTitle () {
      if (this.user.signedIn) return `Candidates (${this.candidatesNum} Selected)`
      else return 'Candidates'
    },
    filteredCandidates () {
      let value = []
      let query = this.query
      value = orderBy(this.candidates, [this.sort.property], [this.sort.order])
      value = value.filter(v => includes(v.keybaseID, query))
      return value
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
    toggleFilter () {
      this.$store.commit('notify', { title: 'Filtering...', body: 'TODO' })
    },
    toggleSearch () {
      this.$store.commit('notify', { title: 'Searching...', body: 'TODO' })
    }
  }
}
</script>
