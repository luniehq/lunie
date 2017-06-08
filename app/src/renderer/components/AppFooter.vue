<template>
  <div class="app-footer">
    <border color="dim"></border>
    <div class="app-footer-container">
      <div v-if="syncing"><i class="fa yellow fa-spin fa-refresh"></i> Syncing chain&hellip; (block {{ syncHeight }})</div>
      <div v-else><i class="fa green fa-circle"></i> Chain up-to-date (height {{ syncHeight }})</div>
      <div> &middot; {{ numPeers }} peers</div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Btn from '@nylira/vue-button'
import Border from './NiBorder'
export default {
  components: {
    Border,
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
    height 2rem
    display flex
    align-items center
    > div
      font-label()
      color dim
      display inline-block

    .menu
      display flex

    .red
      color hsl(0,100%,35%)
    .green
      color hsl(120,100%,35%)
</style>
