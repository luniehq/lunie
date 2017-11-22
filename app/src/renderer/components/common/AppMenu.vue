<template lang="pug">
modal-menu.app-menu
  app-table-of-contents
</template>

<script>
import {mapGetters} from 'vuex'
import ModalMenu from './NiModalMenu'
import AppTableOfContents from './AppTableOfContents'
export default {
  name: 'app-menu',
  components: {
    ModalMenu,
    AppTableOfContents
  },
  computed: {
    ...mapGetters(['proposals', 'proposalStages', 'validators', 'discussions']),
    proposalAlerts () {
      return this.proposals
        .filter(p => p.flags.read === false).length
    },
    isValidatorPage () { return this.$route.params.validator }
  }
}
</script>

<style lang="stylus">
@require '~@/styles/variables.styl'

@media screen and (min-width: 1024px)
  .ni-modal-menu.app-menu
    display none
</style>
