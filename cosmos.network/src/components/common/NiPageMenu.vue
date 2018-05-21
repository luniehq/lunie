<template lang='pug'>
.ni-page-menu: slot
</template>

<script>
export default {
  name: "ni-page-header-menu"
}
</script>

<style lang="stylus">
@require '~variables'

.ni-page-menu
  background app-fg
  height 2rem
  overflow auto
  width 100vw
  display flex
  align-items center
  padding 0 0.25rem

  a
    padding 0 0.5rem
    height 1.5rem
    font-size sm
    margin 0 0.25rem
    border-radius 0.25rem
    display flex
    align-items center
    justify-content center

    color var(--txt)
    border 2px solid var(--bc)
    background var(--app-bg)

    i
      margin-left 0.5rem

    &:last-of-type
      margin-right 0.5rem

    &:hover
    &.router-link-exact-active
      color bright
      background var(--app-bg)
      border 2px solid var(--accent)

    &.router-link-exact-active
      cursor default

@media screen and (min-width: 414px)
  .ni-page-menu
    height 2.5rem
    padding 0 0.5rem
    justify-content center
    a
      margin 0 0.5rem
      padding 0 0.75rem
      font-size x
      height 2rem

@media screen and (min-width: 768px)
  .ni-page-menu
    height 3rem
    a
      padding 0 1rem
</style>
