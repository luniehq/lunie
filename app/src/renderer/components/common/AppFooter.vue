<template lang='pug'>
footer.app-footer
  .container
    .copyright &copy; 2017 Interchain Foundation
</template>

<script>
import {mapGetters} from 'vuex'
export default {
  name: 'app-footer',
  computed: {
    ...mapGetters(['syncHeight', 'syncTime', 'syncing', 'numPeers'])
  }
}
</script>

<style lang="stylus">
@require '~@/styles/variables.styl'

.app-footer
  .container
    border-top 1px solid bc-dim
    height 3rem
    display flex
    align-items center
    justify-content space-between
    padding 0 1rem

    font-label()
    color dim
</style>
