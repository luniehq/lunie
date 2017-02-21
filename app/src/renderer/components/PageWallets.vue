<template>
  <div class="page-wallets">
    <page-header title="Wallets">
      <btn value="New Wallet"></btn>
    </page-header>
    <div class="wallets scrollable-area">
      <div class="wallets-container">
        <card-wallet v-for="value, key in wallets"
          :wallet-key="key"
          :wallet-value="value">
        </card-wallet>
      </div>
      <a class="new-wallet">
        <header><i class="fa fa-plus-square"></i> New Wallet</header>
      </a>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import PageHeader from './PageHeader'
import CardWallet from './CardWallet'
import Btn from '@nylira/vue-button'
export default {
  components: {
    PageHeader,
    CardWallet,
    Btn
  },
  computed: {
    wallets () {
      return this.allAccounts
    },
    ...mapGetters(['allAccounts'])
  }
}
</script>

<style lang="stylus">
@require '../styles/variables.styl'

.page-wallets
  flex 1
  display flex
  flex-flow column

.wallets
  flex 1
  padding 0.25rem

  .wallets-container
    flex 1

    display flex
    flex-flow column

  .new-wallet
    border 0.125rem dashed bc
    margin 0.25rem
    height 3rem
    padding 0 0.5rem
    display flex
    align-items center
    justify-content center

    cursor pointer
    &:hover
      background lighten(link, 90%)
    header
      color light
      font-weight 500
      i.fa
        margin-right 0.25rem
        color light
</style>

