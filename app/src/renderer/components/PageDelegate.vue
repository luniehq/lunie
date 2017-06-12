<template lang="pug">
.page.page-candidates
  page-header(title='Delegate Atoms')
    countdown-string(date='2017-07-10')
    btn(theme='cosmos' type='link' to='/' icon="angle-left" value='Change Candidates')
  .candidates
    .candidates-container
      .delegation-form(v-for='c in filteredCandidates', key='c.id')
        card-candidate(:candidate='c')
        form-group
          label Delegate how many atoms?
          field(
            theme="cosmos"
            type="text"
            placeholder="Atoms"
            v-model="getShoppingCartItem(c.id).atoms")
</template>

<script>
import { mapGetters } from 'vuex'
import Btn from '@nylira/vue-button'
import CountdownString from './CountdownString'
import CardCandidate from './CardCandidate'
import Field from '@nylira/vue-input'
import FormGroup from './FormGroup'
import FormStruct from './FormStruct'
import PageHeader from './PageHeader'
export default {
  name: 'page-candidates',
  components: {
    CardCandidate,
    Btn,
    CountdownString,
    Field,
    FormGroup,
    FormStruct,
    PageHeader
  },
  computed: {
    ...mapGetters(['shoppingCart', 'candidates']),
    filteredCandidates () {
      let ids = this.shoppingCart.map(c => c.candidateId)
      return this.candidates.filter(c => ids.includes(c.id))
    }
  },
  methods: {
    getShoppingCartItem (candidateId) {
      return this.shoppingCart.find(c => c.candidateId === candidateId)
    }
  }
}
</script>
<style lang="stylus">
@import '../styles/variables.styl'

.delegation-form
  border 2px solid bc-dim
  margin-top 1rem
  border-radius 0.25rem
  padding 1rem - 2*px
  &:last-of-type
    margin-bottom 1rem

  .ni-form-group
    display flex
    margin -0.5rem -1rem -1rem
    label
      flex 1
    .ni-field
      flex 1
      width inherit

</style>

