<template lang="pug">
.tm-li-session
  .tm-li-session-icon: i.material-icons {{ icon }}
  .tm-li-session-text
    .tm-li-session-title {{ title }}
    .tm-li-session-subtitle {{ subtitle }}
</template>

<script>
export default {
  name: "tm-li-session",
  props: ["icon", "title", "subtitle"]
}
</script>

<style lang="stylus">
@import '~variables'

.tm-li-session
  display flex
  flex-flow row nowrap
  user-select none
  border-bottom 2px solid var(--bc-dim)

  &:last-of-type
    border-bottom none

  &:hover
    cursor pointer
    background var(--hover-bg)
    .tm-li-session-icon i
    .tm-li-session-title
      color var(--txt)

.tm-li-session-icon
  height 5rem
  flex 0 0 5rem
  display flex
  align-items center
  justify-content center
  i
    font-size 2rem

.tm-li-session-text
  flex 1
  display flex
  justify-content center
  flex-flow column nowrap
  padding 1rem 1rem

.tm-li-session-title
  color var(--txt)
  font-size lg
  line-height 1.25
  margin-bottom 0.375rem

.tm-li-session-subtitle
  color var(--dim)
  font-size sm
</style>
