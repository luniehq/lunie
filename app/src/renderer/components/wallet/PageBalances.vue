<template>
  <div class="page-wallets">
    <!-- <page-header title="Balances"></page-header> -->
    <div class="wallets scrollable-area">
      <div class="wallets-container">
        <card-balance v-for="balance in wallet.balances"
          :balance="balance">
        </card-balance>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import CardBalance from './CardBalance'
import Btn from '@nylira/vue-button'
import CardNew from './CardNew'
export default {
  components: {
    CardBalance,
    Btn,
    CardNew
  },
  computed: {
    ...mapGetters(['wallet'])
  }
}
</script>

<style lang="stylus">
@require '../../styles/variables.styl'

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
