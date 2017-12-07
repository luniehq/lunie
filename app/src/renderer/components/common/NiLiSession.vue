<template lang="pug">
.ni-li-session
  .ni-li-session-icon: i.material-icons {{ icon }}
  .ni-li-session-text
    .ni-li-session-title {{ title }}
    .ni-li-session-subtitle {{ subtitle }}
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

  &:hover
    cursor pointer
    background app-fg
    .ni-li-session-icon i
      color bright
    .ni-li-session-title
      color bright

.ni-li-session-icon
  height 5rem
  flex 0 0 5rem
  display flex
  align-items center
  justify-content center
  i
    font-size 2rem

.ni-li-session-text
  flex 1
  display flex
  justify-content center
  flex-flow column nowrap
  padding 1rem 1rem

.ni-li-session-title
  color txt
  font-size lg
  line-height 1.25
  margin-bottom 0.375rem

.ni-li-session-subtitle
  color dim
  font-size sm
</style>
