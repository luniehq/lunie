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
@require '~variables'

.app-footer
  .container
    border-top px solid bc
    height 3rem
    display flex
    align-items center
    justify-content space-between
    padding 0 1rem

    color dim
</style>
