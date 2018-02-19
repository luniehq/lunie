<template lang="pug">
modal.ni-modal-help(v-if="active" :close="close")
  div(slot='title') Need Help?
  p Something in the app not working correctly? Tell us what went wrong in developer chat or create an issue on our GitHub. Thanks for improving Cosmos Voyager!
  list-item(
    title="Developer Chat"
    href="https://riot.im/app/#/room/#cosmos:matrix.org")
  list-item(
    title="GitHub Issues"
    href="https://github.com/cosmos/voyager/issues")
</template>

<script>
import {mapGetters} from 'vuex'
import Btn from '@nylira/vue-button'
import Modal from 'common/NiModal'
import ListItem from 'common/NiListItem'
export default {
  name: 'ni-modal-help',
  components: {
    ListItem,
    Btn,
    Modal
  },
  computed: {
    ...mapGetters(['config']),
    active () { return this.config.modals.help.active }
  },
  methods: {
    close () { this.$store.commit('setModalHelp', false) }
  }
}
</script>

<style lang="stylus">
@import '~variables'

.ni-modal.ni-modal-help
  z-index z(modalHelp)

  .ni-modal-main
    padding 2rem

    p
      margin 0 0 2rem
</style>
