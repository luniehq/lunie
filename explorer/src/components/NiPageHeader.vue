<template lang='pug'>
header.ni-page-header
  .ni-page-header-container
    h1.ni-page-header-title
      slot(name='title')
    nav.ni-page-header-nav
      slot
</template>

<script>
export default {
  name: 'ni-page-header'
}
</script>

<style lang="stylus">
@require '../styles/variables.styl'

.ni-page-header
  min-height 3rem
  border-bottom 1px solid bc-dim
  // background app-fg
  padding 0.75rem 1rem 0.75rem - px
  display flex
  align-items center

.ni-page-header-title:empty
  display none

.ni-page-header-title > div
  display flex
  align-items center
  
  font-size 1.25rem
  line-height 1.5rem
  font-weight 400
  color bright

@media screen and (min-width: 1024px)
  .ni-page-header
    border-bottom-color bc
</style>
