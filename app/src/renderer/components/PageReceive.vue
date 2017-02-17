<template>
  <div class="page-receive">
    <page-header title="Receive"></page-header>
    <form class="form">
      <div class="form-group">
        <label>Generate Receive Address</label>
        <btn
          icon="refresh"
          value="Generate Address"
          @click.native="generateAddress()">
        </btn>
      </div>
    </form>
    <div class="addresses">
      <card-address
        v-for="address in addresses"
        :address="address">
      </card-address>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import PageHeader from './PageHeader'
import CardAddress from './CardAddress'
import Field from '@nylira/vue-input'
import Btn from '@nylira/vue-button'
export default {
  components: {
    PageHeader,
    CardAddress,
    Field,
    Btn
  },
  computed: {
    ...mapGetters([
      'allAddresses',
      'allWallets'
    ]),
    addresses () {
      return this.allAddresses.slice().reverse()
    },
    wallets () {
      return this.allWallets
    }
  },
  methods: {
    ...mapActions(['generateAddress'])
  }
}
</script>

<style lang="stylus">
@require '../styles/variables.styl'

div.page-receive
  display flex
  flex-direction column
  max-height 50%

div.addresses
  padding 0.5rem
  flex-grow 1
</style>
