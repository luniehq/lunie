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
      <new-bar @click.native="createWallet()" icon="plus-square" value="New Wallet"></new-bar>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import PageHeader from './PageHeader'
import CardWallet from './CardWallet'
import Btn from '@nylira/vue-button'
import NewBar from './NewBar'
export default {
  components: {
    PageHeader,
    CardWallet,
    Btn,
    NewBar
  },
  computed: {
    wallets () { return this.allWallets },
    ...mapGetters(['allWallets'])
  },
  methods: {
    ...mapActions(['createWallet'])
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
</style>
