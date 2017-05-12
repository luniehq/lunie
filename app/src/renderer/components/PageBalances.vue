<template>
  <div class="page-wallets">
    <page-header title="Balances">
      <!-- <btn @click.native="newWallet()" icon="plus-square" value="New Wallet"></btn> -->
    </page-header>
    <div class="wallets scrollable-area">
      <div class="wallets-container">
        <template v-for="wallet in wallets">
          <card-balance v-for="balance in wallet.balances"
            :balance="balance">
          </card-balance>
        </template>
      </div>
      <!-- <card-new @click.native="newWallet()" icon="plus-square" value="New Wallet"></card-new> -->
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import PageHeader from './PageHeader'
import CardBalance from './CardBalance'
import Btn from '@nylira/vue-button'
import CardNew from './CardNew'
export default {
  components: {
    PageHeader,
    CardBalance,
    Btn,
    CardNew
  },
  computed: {
    ...mapGetters(['allWallets']),
    wallets () { return this.allWallets }
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
