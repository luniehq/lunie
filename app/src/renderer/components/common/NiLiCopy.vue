<template lang="pug">
.ni-li-copy
  .value {{ value }}
  menu
    btn-copy(:value='value')
    btn.receive(
      value='Receive'
      @click.native="enableModalReceive"
      icon="file_download")
</template>

<script>
import BtnCopy from 'common/NiBtnCopy'
import Btn from '@nylira/vue-button'
export default {
  name: 'ni-li-copy',
  components: { BtnCopy, Btn },
  props: ['value'],
  methods: {
    enableModalReceive () {
      this.$store.commit('setModalReceive', true)
    }
  }
}
</script>

<style lang="stylus">
@require '~variables'

.ni-li-copy
  height 3rem
  display flex
  align-items center
  border-bottom px solid bc-dim
  &:only-child
    border-bottom none

  .value
    flex 1
    padding 0 1rem

    overflow hidden
    text-overflow ellipsis
    white-space nowrap

  .receive
    margin-left 0.5rem

  menu
    display flex
    align-items center
    padding 0 0.75em
</style>
