<template lang="pug">
.ni-tab-bar
  .ni-tab-bar-container: slot
</template>

<script>
export default { name: "ni-tab-bar" }
</script>

<style lang="stylus">
@require '~variables'

.ni-tab-bar-container
  display flex
  align-items center

  background app-fg
  border-bottom px solid bc

  a
    height 2rem - px
    display block
    padding 0 1rem

    display flex
    align-items center
    justify-content center

    border-right px solid bc

    font-size sm
    color link

    &:last-of-type
      border-right none

    &.router-link-active
      color bright
      background app-bg

    i.material-icons
      font-size xl
</style>
