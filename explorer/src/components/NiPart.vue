<template lang='pug'>
section.ni-part
  .ni-part-container
    header.ni-part-header(v-if="$slots['title'] || title")
      .ni-part-header-container
        h2.ni-part-title
          template(v-if='title') {{ title }}
          slot(name='title', v-else='')
        menu.ni-part-menu
          slot(name='menu')
    main.ni-part-main
      slot
</template>

<script>
export default {
  name: 'ni-part',
  props: ['title']
}
</script>

<style lang="stylus">
@require '~@/styles/variables.styl'

.ni-part
  position relative

.ni-part-container
.ni-part-header
.ni-part-title
.ni-part-menu
.ni-part-main
  &:empty
    display none

.ni-part-container
  margin 0 auto

.ni-part-header
  margin-top 1rem
  height 2rem
  padding 0 1rem
  border-bottom 1px solid bc-dim

.ni-part-header-container
  display flex
  align-items center
  height 2rem - px

.ni-part-title
.ni-part-menu
  font-label()
  color dim

  span.dim
    font-weight faint

  a
    color link
    border-bottom 1px dotted bc

.ni-part-title
  flex 1
</style>
