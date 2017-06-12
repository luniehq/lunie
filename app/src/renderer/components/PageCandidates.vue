<template lang="pug">
.page.page-candidates
  page-header(title='Candidates')
    countdown-string(date='2017-07-10')
    field(theme='cosmos', type='text', placeholder='Filter...', v-model='query')
  panel-sort(:sort='sort')
  .candidates
    card-candidate(v-for='candidate in filteredCandidates', key='candidate.id', :candidate='candidate')
  page-candidates-footer
</template>

<script>
import { mapGetters } from 'vuex'
import { orderBy, includes } from 'lodash'
import Btn from '@nylira/vue-button'
import CountdownString from './CountdownString'
import CardCandidate from './CardCandidate'
import Field from '@nylira/vue-input'
import PageCandidatesFooter from './PageCandidatesFooter'
import PageHeader from './PageHeader'
import PanelSort from './PanelSort'
export default {
  name: 'page-candidates',
  components: {
    Btn,
    CardCandidate,
    CountdownString,
    Field,
    PageCandidatesFooter,
    PageHeader,
    PanelSort
  },
  computed: {
    ...mapGetters(['candidates']),
    filteredCandidates () {
      let value = []
      let query = this.query
      if (this.candidates) {
        value = orderBy(this.candidates, [this.sort.property], [this.sort.order])
        value = value.filter(v => includes(v.id, query))
      }
      return value
    }
  },
  data: () => ({
    query: '',
    sort: {
      property: 'atoms',
      order: 'desc',
      properties: [
        { id: 1, title: 'Candidate ID', value: 'id' },
        { id: 2, title: 'Atoms', value: 'atoms', initial: true },
        { id: 3, title: 'Delegators', value: 'delegators' }
      ]
    }
  })
}
</script>
