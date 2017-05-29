<template>
  <div class="page-delegation">
    <page-header title="Delegation Game">
    </page-header>
    <div class="delegation scrollable-area">
      <div class="delegation-container">
        <card-validator
          v-for="validator in validators"
          key="validator.id">
        </card-validator>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import PageHeader from './PageHeader'
import CardValidator from './CardValidator'
export default {
  components: {
    CardValidator,
    PageHeader
  },
  computed: {
    ...mapGetters(['allValidators']),
    validators () {
      if (this.allValidators) {
        return this.allValidators
      } else {
        return []
      }
    }
  }
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
