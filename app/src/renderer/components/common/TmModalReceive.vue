<template lang="pug">
modal.tm-modal-receive(v-if="active" :close="close")
  div(slot='title') Receive Tokens
  p You can receive Cosmos tokens of any denomination by sharing this address.
  li-copy.receive-modal(:value="wallet.address")
</template>

<script>
import { mapGetters } from "vuex"
import LiCopy from "common/TmLiCopy"
import Modal from "common/TmModal"
export default {
  name: "tm-modal-receive",
  props: ["value"],
  components: {
    LiCopy,
    Modal
  },
  computed: {
    ...mapGetters(["config", "wallet"]),
    active() {
      return this.config.modals.receive.active
    }
  },
  methods: {
    close() {
      this.$store.commit("setModalReceive", false)
    }
  }
}
</script>

<style lang="stylus">
@import '~variables'

.tm-modal.tm-modal-receive
  z-index z(modalError)

  .tm-modal-main
    padding 2rem

    p
      margin 0 0 2rem

  .receive-modal
    border 1px solid bc

  .value
    padding 0
</style>
