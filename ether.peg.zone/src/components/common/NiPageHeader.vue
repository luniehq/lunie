<template lang='pug'>
header.ni-page-header
  .ni-page-header-backdrop: img(src="~assets/images/logos/cosmos-logo.png")
  .ni-page-header-splash
    img(v-if="splash === 'validator'"
      src="~assets/images/logos/cosmos-validator.png")
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
  props: ['icon', 'splash']
}
</script>

<style lang="stylus">
@require '~variables'

.ni-page-header
  min-height 3rem
  padding 1rem
  display flex
  align-items center
  position relative
  overflow hidden

.ni-page-header-splash
  position absolute
  top 50%
  margin-top -12.5vw
  right 0
  img
    width 25vw
    height 25vw
    opacity 0.25

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

  .ni-page-header-splash
    top 50%
    margin-top -3.5rem + 0.5rem
    right 1.5rem
    img
      opacity 1
      width 7rem
      height 7rem

@media screen and (max-width: 1023px)
  .ni-page-header
    border-bottom 1px solid bc

  .ni-page-header-menu
  .ni-page-header-backdrop
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

  .ni-page-header-backdrop img
    position fixed
    bottom -5vw
    left -5vw
    opacity 0.02
    width 66.66vw
    height 66.66vw
    z-index -1
</style>
