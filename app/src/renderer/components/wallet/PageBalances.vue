<template>
  <div class="page-wallets">
    <!-- <page-header title="Balances"></page-header> -->
    <div class="address">
      <h2 class="label">Your Address</h2>
      <div class="address-container">
        <card-address :address="wallet.key.address"></card-address>
      </div>
    </div>
    <br />
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
import CardAddress from './CardAddress'
import CardBalance from './CardBalance'
import Btn from '@nylira/vue-button'
import CardNew from './CardNew'
export default {
  components: {
    CardAddress,
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

h2.label
  margin 10px 8px
  font-size 0.9em
  font-weight 500
  text-transform uppercase
  color rgb(96, 112, 130)
</style>
