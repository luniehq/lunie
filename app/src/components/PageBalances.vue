<template>
  <div class="page-balances">
    <page-header title="Wallets"></page-header>
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
import { mapGetters } from 'vuex'
import PageHeader from './PageHeader'
import CardAccount from './CardAccount'
export default {
  components: {
    PageHeader,
    CardAccount
  },
  computed: {
    accounts () {
      return this.allAccounts
    },
    ...mapGetters(['allAccounts'])
  }
}
</script>

<style lang="stylus">
@require '../styles/variables.styl'

.accounts
  padding 0.25rem
  .accounts-container
    display flex
    flex-flow column
    .card-account
      flex 1
</style>

