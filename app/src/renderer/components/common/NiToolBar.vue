<template lang="pug">
.ni-tool-bar
  .ni-tool-bar-container: slot
</template>

<script>
export default {
  name: 'ni-tool-bar'
}
</script>

<style lang="stylus">
@require '~@/styles/variables.styl'

.ni-tool-bar
  position fixed
  bottom 0
  left 0
  z-index 90

  width 100vw

.ni-tool-bar-container
  height 3rem

  display flex
  justify-content space-between
  align-items center

  border-top 1px solid bc
  background app-bg-alpha

  a
    display flex
    align-items center
    justify-content center
    height 3rem
    padding 0 1rem

    display flex
    align-items center
    justify-content center

    user-select none


    cursor pointer

    border-bottom 0.25rem solid transparent

    i.material-icons
      font-size xl

    .label
      display none
    
    &.router-link-active
      border-color mc
      color bright

    &:hover:not([disabled])
      color bright

    &[disabled]
      color dim
      cursor default

@media screen and (min-width: 1024px)
  .ni-tool-bar
    display none
</style>
