<template lang='pug'>
header.ni-page-header
  .ni-page-header-container
    slot(name="votes")
    .text
      .h1.ni-page-header-title.break-lines
        i.material-icons(v-if="icon") {{ icon }}
        slot(name='title')
      .h4.ni-page-header-subtitle.break-lines
        slot(name='subtitle')
    nav.ni-page-header-menu
      slot(name='menu')
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
  min-height 3rem
  padding 1rem
  display flex
  align-items center

.ni-page-header-container
  display flex

  // move it to the left
  .ni-votes
    margin-left -1rem

.ni-page-header-title
  display flex
  align-items center

  &:empty
    display none

  > i.material-icons
    padding-right 0.375rem

.ni-page-header-title > div
  display flex
  align-items center
  color bright
  font-weight 500

.ni-page-header-subtitle > div
  color dim

.ni-page-header-title + .ni-page-header-subtitle
  margin-top 0.25rem

@media screen and (min-width: 768px)
  .ni-page-header
    padding 3rem 1rem

@media screen and (max-width: 1023px)
  .ni-page-header-menu
    display none

@media screen and (min-width: 1024px)
  .ni-page-header-container
    flex 1
    display flex
    flex-flow row nowrap
    align-items center
    .text
      flex 1
      margin-right 1rem

  .ni-page-header-menu
    display block
    .ni-btn
      margin-left 0.5rem
</style>
