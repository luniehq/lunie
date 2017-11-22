<template lang='pug'>
.ni-page-menu: slot
</template>

<script>
export default {
  name: 'ni-page-header-menu'
}
</script>

<style lang="stylus">
@require '~variables.styl'

.ni-page-menu
  background app-fg
  display flex
  justify-content center
  align-items center

  a
    padding 0 1rem
    line-height 2rem
    font-size sm
    color dim

    &:hover
      color bright

    &.router-link-exact-active
      color bright

@media screen and (min-width: 414px)
  .ni-page-menu a
    font-size x
    line-height 2.5rem

@media screen and (min-width: 768px)
  .ni-page-menu a
    line-height 3rem
</style>
