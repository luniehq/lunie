<template lang="pug">
.ni-li-address(:id='cssId')
  .value {{ value }}
  menu
    btn-copy(:value='value')
</template>

<script>
import BtnCopy from 'wallet/BtnCopy'
export default {
  name: 'ni-li-address',
  components: {
    BtnCopy
  },
  computed: {
    cssId () {
      return 'address-' + this.value
    }
  },
  props: ['value']
}
</script>

<style lang="stylus">
@require '~variables'

.ni-li-address
  height 3rem
  display flex
  align-items center
  border-bottom 1px solid bc-dim

  .value
    flex 1
    padding 0 0.75em

    overflow hidden
    text-overflow ellipsis
    white-space nowrap

  menu
    display flex
    align-items center
    padding 0 0.75em
</style>
