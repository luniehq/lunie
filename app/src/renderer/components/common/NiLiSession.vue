<template lang="pug">
.ni-li-session
  .icon: i.material-icons {{ icon }}
  .text
    .title {{ title }}
    .subtitle {{ subtitle }}
</template>

<script>
export default {
  name: 'ni-li-session',
  props: ['icon', 'title', 'subtitle']
}
</script>

<style lang="stylus">
@import '~variables'

.ni-li-session
  display flex
  flex-flow row nowrap
  user-select none
  border-bottom 2*px solid bc-dim
  &:last-of-type
    border-bottom none

  .icon
    height 5rem
    flex 0 0 5rem
    display flex
    align-items center
    justify-content center
    i
      font-size 2rem

  .text
    flex 1
    display flex
    justify-content center
    flex-flow column nowrap
    padding 1rem 1rem

  .title
    color txt
    font-size lg
    line-height 1.25
    margin-bottom 0.375rem

  .subtitle
    color dim
    font-size sm

  &:hover
    cursor pointer
    background app-fg
    .icon
      i
        color bright
    .title
      color bright
</style>

