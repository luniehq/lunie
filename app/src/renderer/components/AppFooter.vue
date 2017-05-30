<template>
  <div class="app-footer">
    <div class="status">
      <div v-if="syncing"><i class="fa yellow fa-spin fa-refresh"></i> Syncing chain&hellip; (block {{ syncHeight }})</div>
      <div v-else><i class="fa green fa-circle"></i> Chain up-to-date (height {{ syncHeight }})</div>
      <div> &middot; {{ numPeers }} peers</div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Btn from '@nylira/vue-button'
export default {
  components: {
    Btn
  },
  data () {
    return {
      statusOnline: true
    }
  },
  computed: {
    ...mapGetters(['syncHeight', 'syncTime', 'syncing', 'numPeers'])
  },
  methods: {
    go (route) {
      this.$router.push(route)
    }
  }
}
</script>

<style lang="stylus">
@require '../styles/variables.styl'

.app-footer
  height 2rem
  border-top 1px solid bc-dim
  background c-app-fg url('../assets/images/background-grid.png')

  margin 0 1rem


  .status
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
