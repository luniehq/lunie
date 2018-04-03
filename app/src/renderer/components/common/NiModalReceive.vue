<template lang="pug">
modal.ni-modal-receive(v-if="active" :close="close")
  div(slot='title') Receive Tokens
  p You can receive tokens by sharing this address.
  p 123ab
</template>

<script>
import { mapGetters } from 'vuex'
import Btn from '@nylira/vue-button'
import Modal from 'common/NiModal'
export default {
  name: 'ni-modal-receive',
  components: {
    Btn,
    Modal
  },
  computed: {
    ...mapGetters(['config']),
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
  z-index z(modalHelp)

  .ni-modal-main
    padding 2rem

    p
      margin 0 0 2rem
</style>
