<template lang="pug">
modal.tm-modal-help(v-if="active" :close="close")
  div(slot='title') Need Help?
  p Something in the app not working correctly? Tell us what went wrong in our <a href="https://riot.im/app/#/room/#cosmos:matrix.org">developer chat</a> or create an issue on <a href="https://github.com/cosmos/voyager/issues">GitHub</a>.
  p Thanks for improving Cosmos Voyager!
</template>

<script>
import { mapGetters } from "vuex"
import Modal from "common/TmModal"
import { TmListItem } from "@tendermint/ui"
export default {
  name: "tm-modal-help",
  components: {
    TmListItem,
    Modal
  },
  computed: {
    ...mapGetters(["config"]),
    active() {
      return this.config.modals.help.active
    }
  },
  methods: {
    close() {
      this.$store.commit("setModalHelp", false)
    }
  }
}
</script>

<style lang="stylus">
@import '~variables'

.tm-modal.tm-modal-help
  z-index z(modalHelp)
</style>
