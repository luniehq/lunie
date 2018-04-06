<template lang="pug">
modal.ni-modal-receive(v-if="active" :close="close")
  div(slot='title') Receive Tokens
  p You can receive tokens of any denomination by sharing this address.
  li-copy.receive-modal(:value="wallet.key.address")
</template>

<script>
import { mapGetters } from 'vuex'
import Btn from '@nylira/vue-button'
import BtnCopy from 'common/NiBtnCopy'
import LiCopy from 'common/NiLiCopy'
import Modal from 'common/NiModal'
import Part from 'common/NiPart'
export default {
  name: 'ni-modal-receive',
  props: ['value'],
  components: {
    Btn,
    BtnCopy,
    LiCopy,
    Modal,
    Part
  },
  computed: {
    ...mapGetters(['config', 'wallet']),
    active () {
      return this.config.modals.receive.active
    }
  },
  methods: {
    close () {
      this.$store.commit('setModalReceive', false)
    }
  }
}
</script>

<style lang="stylus">
@import '~variables'

.ni-modal.ni-modal-receive
  z-index z(modalError)

  .ni-modal-main
    padding 2rem

    p
      margin 0 0 2rem

  .receive-modal
    border 1px solid bc

  .value
    padding 0
</style>
