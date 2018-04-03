<template lang="pug">
.ni-modal-menu: slot
</template>

<script>
export default { name: 'ni-modal-menu' }
</script>

<style lang="stylus">
@require '~variables'

.ni-modal-menu
  background var(--app-bg-alpha)
  z-index z(default)
  user-select none
  backdrop-filter blur(0.5rem)
  overflow-y scroll

@media screen and (max-width:1023px)
  .ni-modal-menu
    padding-top 3rem
    height 100vh
    position fixed
    top 0
    left 0
    bottom 0
    width 100vw
</style>
