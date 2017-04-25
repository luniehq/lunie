<template>
  <div class="page-wallets">
    <page-header title="Balances">
      <!-- <btn @click.native="newWallet()" icon="plus-square" value="New Wallet"></btn> -->
    </page-header>
    <div class="wallets scrollable-area">
      <div class="wallets-container">
        <card-wallet v-for="value, key in wallets"
          :wallet-value="value">
        </card-wallet>
      </div>
      <!-- <card-new @click.native="newWallet()" icon="plus-square" value="New Wallet"></card-new> -->
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import PageHeader from './PageHeader'
import CardWallet from './CardWallet'
import Btn from '@nylira/vue-button'
import CardNew from './CardNew'
export default {
  components: {
    PageHeader,
    CardWallet,
    Btn,
    CardNew
  },
  computed: {
    wallets () { return this.allWallets },
    ...mapGetters(['allWallets'])
  },
  methods: {
    newWallet () {
      this.$store.commit('notifyError', {
        title: 'Wallet Not Created',
        body: `Wallet creation is currently being worked on. Try again soon!`
      })
      // this.createWallet()
    },
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
