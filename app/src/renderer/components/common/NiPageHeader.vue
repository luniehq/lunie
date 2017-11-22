<template lang='pug'>
header.ni-page-header
  .ni-page-header-container
    h1.ni-page-header-title.break-lines
      i.material-icons(v-if="icon") {{ icon }}
      slot(name='title')
    .ni-page-header-subtitle.break-lines
      slot(name='subtitle')
    nav.ni-page-header-nav
      slot
</template>

<script>
export default {
  name: 'ni-page-header',
  props: ['icon']
}
</script>

<style lang="stylus">
@require '~@/styles/variables.styl'

.ni-page-header
  min-height 3rem
  border-bottom 1px solid bc
  // background app-fg
  padding 0.75rem 1rem 0.75rem - px
  display flex
  align-items center

.ni-page-header-title
  display flex
  align-items center

  &:empty
    display noen

  i.material-icons
    font-size 1.375rem
    padding-right 0.375rem

.ni-page-header-title > div
  display flex
  align-items center
  
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
</style>
