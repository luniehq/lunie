<template lang='pug'>
.ni-modal-search
  .ni-modal-search-container
    slot
</template>

<script>
export default {
  name: 'ni-modal-search',
}
</script>

<style lang="stylus">
@require '~@/styles/variables.styl'

.ni-modal-search
  height 3rem
  width 100vw

  position fixed
  bottom 0
  left 0
  width 100vw

  z-index 100

.ni-modal-search-container
  display flex
  height 3rem
  padding 0.5rem
  background #000
  background mc
  border-top 1px solid bc-dim
  .ni-field
    margin-right 0.5rem
    background app-bg

@media screen and (min-width: 1024px)
  .ni-modal-search-container
    margin-left width-side
</style>
