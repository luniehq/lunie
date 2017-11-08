<template lang='pug'>
footer.app-footer
  .container
    .status(v-if='syncing')
      i.fa.yellow.fa-spin.fa-refresh
      |  Syncing chain&hellip; \#{{ syncHeight }} ({{ new Date(syncTime).toISOString() }})
    .status(v-else='')
      i.fa.green.fa-circle
      |  Chain up-to-date (\#{{ syncHeight }})
    .connection Connected to {{ nodeIP }}
  .container
    .copyright &copy; 2017 Interchain Foundation
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  name: 'app-footer',
  computed: {
    ...mapGetters(['syncHeight', 'syncTime', 'syncing', 'nodeIP'])
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
