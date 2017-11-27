<template lang='pug'>
section.ni-part
  .ni-part-container
    header.ni-part-header(v-if="$slots['title'] || title")
      .ni-part-header-container
        .ni-part-title.h5
          template(v-if='title') {{ title }}
          slot(name='title', v-else='')
        menu.ni-part-menu
          slot(name='menu')
    main.ni-part-main: slot
</template>

<script>
export default {
  name: 'ni-part',
  props: ['title']
}
</script>

<style lang="stylus">
@require '~variables'

.ni-part
  position relative
  max-width width-main

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
  // margin-top 1rem
  height 2rem
  padding 0 1rem
  background app-fg

.ni-part-header-container
  display flex
  align-items center
  height 2rem - px

.ni-part-title
.ni-part-menu
  color dim
  margin 0

  a
    color link
    &:hover
      color hover

.ni-part-title
  flex 1
  color bright
  text-transform uppercase
  font-size sm
  font-weight 400
</style>
