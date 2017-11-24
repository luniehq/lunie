<template>
  <div class="page-receive">
    <!-- <page-header title="Receive"> -->
      <btn
        icon="plus-square"
        value="Generate Address"
        @click.native="newAddress()">
      </btn>
    <!-- </page-header> -->
    <div class="addresses scrollable-area">
      <transition-group name="fade">
        <card-address
          :key="address.address"
          v-for="address in addresses"
          :address="address">
        </card-address>
      </transition-group>
      <card-new @click.native="newAddress()" icon="plus-square" value="Generate Address"></card-new>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import CardAddress from 'wallet/CardAddress'
import Field from '@nylira/vue-field'
import Btn from '@nylira/vue-button'
import CardNew from 'wallet/CardNew'
export default {
  components: {
    CardAddress,
    Field,
    Btn,
    CardNew
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
    newAddress () {
      this.generateAddress()
      this.$store.commit('notifyCustom', {
        title: 'Receive Address Created',
        body: `A new receive address has just been created.`
      })
    },
    ...mapActions(['generateAddress'])
  }
}
</script>

<style lang="stylus">
@require '~variables'

.page-receive
  display flex
  flex-direction column

.addresses
  padding 0.25rem
  flex-grow 1

// animation
.fade-enter-active, .fade-leave-active
  transition all 0.5s ease
  opacity 1
  transform scaleY(1.0)
  height 3.5rem

.fade-enter, .fade-leave-to
  opacity 0.5
  transform scaleY(0.01)
  height 0
</style>
