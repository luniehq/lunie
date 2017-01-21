<template>
  <div class="page-balances">
    <page-header title="Balances"></page-header>
    <div class="accounts">
      <div class="accounts-container">
        <card-account data="account"></card-account>
        <card-account data="account"></card-account>
        <card-account data="account"></card-account>
        <card-account data="account"></card-account>
        <card-account data="account"></card-account>
      </div>
    </div>
  </div>
</template>

<script>
import PageHeader from './PageHeader'
import CardAccount from './CardAccount'
export default {
  components: {
    PageHeader,
    CardAccount
  },
  data () {
    return {
      account: {
        key: 'PubKey', // will be null if the account has received money but not spent any yet
        sequence: 1000,
        coins: [
          { denom: 'test', amount: 1000000 },
          { denom: 'atom', amount: 1234 }
        ]
      }
    }
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

