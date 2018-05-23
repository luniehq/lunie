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
@require '../styles/variables.styl'

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

  border-top 1px solid bc-dim
  background app-bg-alpha

  a
    display block
    height 3rem
    padding 0 1rem

    display flex
    align-items center
    justify-content center
    color link

    user-select none

    i.material-icons
      font-size 1.5rem

    cursor pointer
    &:hover
      color bright

@media screen and (min-width: 1024px)
  .ni-tool-bar
    padding-left 16rem
</style>
