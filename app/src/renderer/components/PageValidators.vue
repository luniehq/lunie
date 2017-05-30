<template>
  <div class="page-validators">
    <page-header title="Delegation Game">
      <countdown-string date="2017-07-10"></countdown-string>
      <field theme="cosmos" type="text" placeholder="Filter..." v-model="query"></field>
    </page-header>
    <panel-sort :sort="sort"></panel-sort>
    <div class="validators scrollable-area">
      <div class="validators-container">
        <card-validator
          v-for="validator in filteredValidators"
          key="validator.id"
          :validator="validator">
        </card-validator>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { orderBy, includes } from 'lodash'
import Btn from '@nylira/vue-button'
import CountdownString from './CountdownString'
import CardValidator from './CardValidator'
import Field from '@nylira/vue-input'
import PageHeader from './PageHeader'
import PanelSort from './PanelSort'
export default {
  name: 'page-validators',
  components: {
    Btn,
    CardValidator,
    CountdownString,
    Field,
    PageHeader,
    PanelSort
  },
  computed: {
    ...mapGetters(['validators']),
    filteredValidators () {
      let value = []
      let query = this.query
      if (this.validators) {
        value = orderBy(this.validators, [this.sort.property], [this.sort.order])
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
        { id: 1, title: 'Validator', value: 'id' },
        { id: 2, title: 'Atoms', value: 'atoms', initial: true },
        { id: 3, title: 'Delegators', value: 'delegators' }
      ]
    }
  })
}
</script>

<style lang="stylus">
@require '../styles/variables.styl'

.page-validators
  flex 1
  display flex
  flex-flow column

.validators.scrollable-area
  flex 1

  .validators-container
    flex 1

    display flex
    flex-flow column
</style>
