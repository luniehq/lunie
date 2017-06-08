<template>
  <div class="page page-candidates">
    <page-header title="Candidates">
      <countdown-string date="2017-07-10"></countdown-string>
      <field theme="cosmos" type="text" placeholder="Filter..." v-model="query"></field>
    </page-header>
    <panel-sort :sort="sort"></panel-sort>
    <div class="candidates">
      <div class="candidates-container">
        <card-candidate
          v-for="candidate in filteredCandidates"
          key="candidate.id"
          :candidate="candidate">
        </card-candidate>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { orderBy, includes } from 'lodash'
import Btn from '@nylira/vue-button'
import CountdownString from './CountdownString'
import CardCandidate from './CardCandidate'
import Field from '@nylira/vue-input'
import PageHeader from './PageHeader'
import PanelSort from './PanelSort'
export default {
  name: 'page-candidates',
  components: {
    Btn,
    CardCandidate,
    CountdownString,
    Field,
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
