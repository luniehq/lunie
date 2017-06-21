<template lang="pug">
.page.page-candidates
  page-header
    div(slot="title") Candidates #[span(v-if='signedIn') ({{candidatesNum }} Selected)]
    field(theme='cosmos', type='text', placeholder='Filter...', v-model='query')
    btn(
      v-if="signedIn && candidatesNum > 0"
      theme='cosmos'
      type='link'
      to='/delegate'
      icon='angle-right'
      icon-pos='right'
      :value='btnLabel')
    btn(
      disabled
      v-else-if='signedIn'
      theme='cosmos'
      icon='angle-right'
      icon-pos='right'
      :value='btnLabel')
  panel-sort(:sort='sort')
  .candidates
    card-candidate(v-for='candidate in filteredCandidates', key='candidate.id', :candidate='candidate')
</template>

<script>
import { mapGetters } from 'vuex'
import { orderBy, includes } from 'lodash'
import Btn from '@nylira/vue-button'
import CardCandidate from './CardCandidate'
import Field from '@nylira/vue-input'
import PageHeader from './PageHeader'
import PanelSort from './PanelSort'
export default {
  name: 'page-candidates',
  components: {
    Btn,
    CardCandidate,
    Field,
    PageHeader,
    PanelSort
  },
  computed: {
    ...mapGetters(['candidates', 'shoppingCart', 'user']),
    filteredCandidates () {
      let value = []
      let query = this.query
      if (this.candidates) {
        value = orderBy(this.candidates, [this.sort.property], [this.sort.order])
        value = value.filter(v => includes(v.id, query))
      }
      return value
    },
    candidatesNum () {
      return this.shoppingCart.length
    },
    btnLabel () {
      return `Delegate`
    },
    signedIn () { return this.user.signedIn }
  },
  data: () => ({
    query: '',
    sort: {
      property: 'atoms',
      order: 'desc',
      properties: [
        { id: 1, title: 'Candidate ID', value: 'id' },
        { id: 2, title: 'Atoms', value: 'computed.atoms', initial: true },
        { id: 3, title: 'Delegators', value: 'computed.delegators' }
      ]
    }
  })
}
</script>
