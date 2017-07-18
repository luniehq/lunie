<template lang="pug">
.page.page-candidates
  page-header
    div(slot="title") Candidates #[span(v-if='isSignedIn') ({{candidatesNum }} Selected)]
    field(theme='cosmos', type='text', placeholder='Filter...', v-model='query')
    btn(
      v-if="isSignedIn && candidatesNum > 0"
      theme='cosmos'
      type='link'
      to='/delegate'
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
      value = orderBy(this.candidates, [this.sort.property], [this.sort.order])
      value = value.filter(v => includes(v.keybaseID, query))
      return value
    },
    candidatesNum () {
      return this.shoppingCart.length
    },
    sort () {
      let props = [
        { id: 1, title: 'Candidate ID', value: 'keybaseID' },
        { id: 2, title: 'Atoms Delegated', value: 'atoms', initial: true }
      ]
      if (this.user.signedIn) {
        props.push({ id: 2, title: 'Atoms Delegated By You', value: 'computed.delegatedAtoms' })
      }
      props.push({ id: 3, title: 'Delegators', value: 'computed.delegators' })
      return {
        property: 'atoms',
        order: 'desc',
        properties: props
      }
    },
    btnLabel () {
      return `Delegate`
    },
    isSignedIn () { return this.user.signedIn }
  },
  data: () => ({
    query: ''
  })
}
</script>
