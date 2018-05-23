<template lang="pug">
.ni-tab-bar
  .ni-tab-bar-container: slot
</template>

<script>
export default {
  name: 'ni-tab-bar'
}
</script>

<style lang="stylus">
@require '../styles/variables.styl'

.ni-tab-bar-container
  display flex
  align-items center

  background app-fg
  border-bottom 1px solid bc-dim

  a
    height 2rem - px
    display block
    padding 0 1rem

    display flex
    align-items center
    justify-content center

    border-right 1px solid bc-dim

    font-size 0.75rem
    color link

    &:last-of-type
      border-right none

    &.router-link-active
      color bright
      background app-bg

    i.material-icons
      font-size 1.5rem
</style>
