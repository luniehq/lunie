<template>
  <div class="page-delegation">
    <page-header title="Delegation Game">
      <field type="text" placeholder="Filter..." v-model="query"></field>
    </page-header>
    <panel-sort :sort="sort"></panel-sort>
    <div class="delegation scrollable-area">
      <div class="delegation-container">
        <card-validator
          v-for="validator in validators"
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
import CardValidator from './CardValidator'
import Field from '@nylira/vue-input'
import PageHeader from './PageHeader'
import PanelSort from './PanelSort'
export default {
  name: 'page-delegation',
  components: {
    Btn,
    CardValidator,
    Field,
    PageHeader,
    PanelSort
  },
  computed: {
    ...mapGetters(['allValidators']),
    validators () {
      let value = []
      let query = this.query
      if (this.allValidators) {
        value = orderBy(this.allValidators, [this.sort.property], [this.sort.order])
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
        { id: 1, title: 'Name', value: 'id' },
        // { id: 1, title: 'IP Address', value: 'ipAddress' },
        { id: 2, title: 'Atoms', value: 'atoms', initial: true },
        { id: 3, title: 'Delegators', value: 'delegators' }
      ]
    }
  })
}
</script>

<style lang="stylus">
@require '../styles/variables.styl'

.page-delegation
  flex 1
  display flex
  flex-flow column

.delegation
  flex 1
  padding 0.25rem

  .delegation-container
    flex 1

    display flex
    flex-flow column
</style>
