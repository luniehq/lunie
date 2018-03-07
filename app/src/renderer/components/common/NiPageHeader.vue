<template lang='pug'>
header.ni-page-header
  .ni-page-header-container
    .ni-page-header-text
      .ni-page-header-title
        slot(name='title')
      .ni-page-header-subtitle
        slot(name='subtitle')
    menu.ni-page-header-menu
      slot(name="menu")
</template>

<script>
export default { name: 'ni-page-header' }
</script>

<style lang="stylus">
@require '~variables'

.ni-page-header
  -webkit-app-region drag

.ni-page-header-title
  font-size xl
  > div
    display inline-block

.ni-page-header-container
  min-height 4.22rem
  border-bottom px solid bc
  display flex

.ni-page-header-text
  flex 1
  display flex
  min-width 0 // fix truncation
  padding 11px 0 0 1rem
  align-items: center

  i.material-icons
    font-size 1.375 * x
    padding-right 0.375rem

  > div
    white-space nowrap
    overflow hidden
    text-overflow ellipsis

  h2
    font-size xl
    font-weight 500
    color bright

@media screen and (min-width: 1024px)
  .ni-page-header
    border-bottom-color bc

  .ni-page-header-container
    display flex

  .ni-page-header-menu
    display flex
    align-items center
</style>
