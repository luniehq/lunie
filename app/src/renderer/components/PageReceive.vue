<template>
  <div class="page-receive">
    <page-header title="Receive">
      <btn
        icon="plus-square"
        value="Generate Address"
        @click.native="generateAddress()">
      </btn>
    </page-header>
    <div class="addresses scrollable-area">
      <transition-group name="fade">
        <card-address
          :key="address.address"
          v-for="address in addresses"
          :address="address">
        </card-address>
      </transition-group>
      <new-bar @click.native="generateAddress()" icon="plus-square" value="Generate Address"></new-bar>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import PageHeader from './PageHeader'
import CardAddress from './CardAddress'
import Field from '@nylira/vue-input'
import Btn from '@nylira/vue-button'
import NewBar from './NewBar'
export default {
  components: {
    PageHeader,
    CardAddress,
    Field,
    Btn,
    NewBar
  },
  computed: {
    ...mapGetters([
      'allAddresses',
      'allWallets'
    ]),
    addresses () {
      return this.allAddresses.slice()
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
