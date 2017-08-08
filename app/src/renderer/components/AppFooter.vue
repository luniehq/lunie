<template lang="pug">
.app-footer
  .app-footer-container
    .status(v-if='syncing')
      i.fa.yellow.fa-spin.fa-refresh
      |  Syncing chain… (block {{ syncHeight }})
    .status(v-else='')
      i.fa.green.fa-circle
      |  Chain up-to-date (height {{ syncHeight }})
    .peers {{ numPeers }} peers
</template>
<script>
import { mapGetters } from 'vuex'
import Btn from '@nylira/vue-button'
export default {
  components: {
    Btn
  },
  computed: {
    ...mapGetters(['syncHeight', 'syncTime', 'syncing', 'numPeers'])
  }
}
</script>

<style lang="stylus">
@require '../styles/variables.styl'

.app-footer
  height 2rem
  background c-app-fg url('../assets/images/background-grid.png')

  margin 0 1rem

.app-footer-container
  border-top 1px solid bc
  height 2rem
  display flex
  align-items center
  justify-content space-between

  .status, .peers
    display inline-block
    font-label()
    color dim

  .red
    color hsl(0,100%,35%)

  .green
    color hsl(120,100%,35%)
</style>
