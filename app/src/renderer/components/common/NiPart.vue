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
  max-width width-main-max

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
  padding 0.5rem 1rem
  margin-bottom 0.5rem
  background var(--app-fg)

.ni-part-header-container
  display flex
  align-items center

.ni-part-title
.ni-part-menu
  color var(--dim)
  margin 0

  a
    color var(--link)
    &:hover
      color var(--hover)

.ni-part-title
  flex 1
  color var(--dim)
  font-size sm
  font-weight 400

@media screen and (min-width: 768px)
  .ni-part-container
    &:last-child
      padding-bottom: 1.5rem
</style>
