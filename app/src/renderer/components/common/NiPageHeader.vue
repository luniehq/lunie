<template lang='pug'>
header.ni-page-header
  .ni-page-header-container
    .ni-page-header-text
      .ni-page-header-title.truncate
        i.material-icons(v-if="icon") {{ icon }}
        slot(name='title')
      .ni-page-header-subtitle.truncate
        slot(name='subtitle')
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

.ni-page-header-container
  min-height 3rem
  border-bottom px solid bc

.ni-page-header-text
  padding 0.75rem 1rem 0.75rem - px

.ni-page-header-title
  display flex
  align-items center

  &:empty
    display none

  i.material-icons
    font-size 1.375rem
    padding-right 0.375rem

.ni-page-header-title > div
  display flex
  align-items center
  
  min-width 0
  font-size 1.25rem
  line-height 1.5rem
  font-weight 400
  color bright

.ni-page-header-subtitle > div
  color dim
  font-size 0.75rem

@media screen and (min-width: 1024px)
  .ni-page-header
    border-bottom-color bc

  .ni-page-header-container
    display flex

  .ni-page-header-text
    flex 1

  .ni-page-header-menu
    flex 0 0 16rem
</style>
