<template lang='pug'>
.ni-connectivity(v-if='connected')
  list-item(icon="done" :title="blockString")
  list-item(icon="settings_ethernet" :title="nodeIP")
.ni-connectivity(v-else)
  list-item(icon="rotate_right" title="Connecting...")
</template>

<script>
import { mapGetters } from 'vuex'
import ListItem from 'common/NiListItem'
import num from 'scripts/num'
export default {
  name: 'ni-connectivity',
  components: {
    ListItem
  },
  computed: {
    ...mapGetters(['lastHeader', 'nodeIP', 'connected', 'validators']),
    blockString () {
      return `${this.lastHeader.chain_id} (#${num.prettyInt(this.lastHeader.height)})`
    }
  },
  data: () => ({
    num: num
  })
}
</script>

<style lang="stylus">
@require '~variables'

.ni-connectivity
  background app-bg

  .ni-li-thumb
    .material-icons
      color success

@media screen and (min-width: 1024px)
  .ni-connectivity
    border-top px solid bc
    height 3rem + px
    display flex
    align-items center
    justify-content space-between
</style>
