<template>
  <div class="page-validator">
    <page-header :title="validator.id">
      <btn value="All Validators"></btn>
    </page-header>
    <div class="scrollable-area">
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Btn from '@nylira/vue-button'
import PageHeader from './PageHeader'
export default {
  name: 'page-delegation',
  components: {
    Btn,
    PageHeader
  },
  computed: {
    ...mapGetters(['allValidators']),
    validator () {
      let value = {}
      if (this.allValidators) {
        value = this.allValidators.filter(v => v.id === this.$route.params.validator)
      }
      return value
    }
  },
  data: () => ({
  })
}
</script>

<style lang="stylus">
@require '../styles/variables.styl'
</style>
