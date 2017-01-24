<template>
  <div class="page-balances">
    <page-header title="Balances"></page-header>
    <div class="accounts">
      <div class="accounts-container">
        <card-account v-for="value, key in accounts"
          :account-key="key"
          :account-value="value">
        </card-account>
      </div>
    </div>
  </div>
</template>

<script>
import PageHeader from './PageHeader'
import CardAccount from './CardAccount'
import { mapGetters } from 'vuex'
export default {
  components: {
    PageHeader,
    CardAccount
  },
  computed: {
    ...mapGetters(['accounts'])
  }
}
</script>

<style lang="stylus">
@require '../styles/variables.styl'

.accounts
  padding 0.25rem
  .accounts-container
    display flex
    flex-flow row wrap
    .card-account
      flex 0 0 50%
      max-width 400px
</style>

