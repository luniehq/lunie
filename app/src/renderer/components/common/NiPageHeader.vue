<template lang='pug'>
header.ni-page-header
  .ni-page-header-container
    .ni-page-header-text
    menu.ni-page-header-menu
      slot(name="menu")
</template>

<script>
export default {
  name: 'ni-page-header',
  props: ['icon']
}
</script>

<style lang="stylus">
@require '~variables'

.ni-page-header
  -webkit-app-region: drag;

.ni-page-header-container
  min-height 3rem
  border-bottom px solid bc
  display flex

.ni-page-header-text
  flex 1
  display flex
  min-width 0 // fix truncation
  padding 0.75rem 1rem 0.75rem - px

  i.material-icons
    font-size 1.375 * x
    padding-right 0.375rem

  > div
    white-space nowrap
    overflow hidden
    text-overflow ellipsis

    font-size lg
    line-height 1.5rem
    font-weight 400
    color bright

    font-size lg
    line-height 1.5rem
    font-weight 400
    color bright

@media screen and (min-width: 1024px)
  .ni-page-header
    border-bottom-color bc

  .ni-page-header-container
    display flex

  .ni-page-header-menu
    flex 0 0 16rem
</style>
