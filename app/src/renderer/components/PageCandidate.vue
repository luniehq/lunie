<template lang="pug">
.page-candidate
  page-header(:title='candidate.id')
    btn(theme='cosmos' type='link' to='/' icon='angle-left' value='Back')
    btn(theme='cosmos' icon='check' value='Stake Atoms')
  .scrollable-area
    key-values
      key-value
        div(slot='key') Atoms
        div(slot='value') {{ candidate.atoms }}
      key-value
        div(slot='key') Delegators
        div(slot='value') {{ candidate.delegators }}
    key-values
      key-value
        div(slot='key') Description
        div(slot='value') {{ candidate.description }}
      key-value
        div(slot='key') URL
        div(slot='value') {{ candidate.url }}
    key-values
      key-value
        div(slot='key') Start Date
        div(slot='value') {{ candidate.startDate }}
      key-value
        div(slot='key') Commission
        div(slot='value') {{ candidate.commission * 100 }}%
    key-values
      key-value
        div(slot='key') Slashes
        div(slot='value') {{ candidate.slashes.length }}
</template>

<script>
import { mapGetters } from 'vuex'
import Btn from '@nylira/vue-button'
import PageHeader from './PageHeader'
import KeyValue from './NiKeyValue'
import KeyValues from './NiKeyValues'
export default {
  name: 'page-candidate',
  components: {
    Btn,
    PageHeader,
    KeyValue,
    KeyValues
  },
  computed: {
    ...mapGetters(['candidates']),
    candidate () {
      let value = {}
      if (this.candidates) {
        value = this.candidates.find(v => v.id === this.$route.params.candidate)
      }
      return value
    }
  },
  data: () => ({
  })
}
</script>
