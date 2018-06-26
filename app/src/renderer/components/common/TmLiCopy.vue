<template lang="pug">
.tm-li-copy
  .value {{ value }}
  menu
    btn-copy(:value='value')
</template>

<script>
import BtnCopy from "common/TmBtnCopy"
export default {
  name: "tm-li-copy",
  components: { BtnCopy },
  props: ["value"]
}
</script>

<style lang="stylus">
@require '~variables'

.tm-li-copy
  height 3rem
  display flex
  align-items center
  border-bottom px solid var(--bc-dim)
  &:only-child
    border-bottom none

  .value
    flex 1
    padding 0 1rem

    overflow hidden
    text-overflow ellipsis
    white-space nowrap

  menu
    display flex
    align-items center
    padding 0 0.75em
</style>
