<template lang='pug'>
section.tm-part
  .tm-part-container
    header.tm-part-header(v-if="$slots['title'] || title")
      .tm-part-header-container
        .tm-part-title.h5
          template(v-if='title') {{ title }}
          slot(name='title', v-else='')
        menu.tm-part-menu
          slot(name='menu')
    main.tm-part-main: slot
</template>

<script>
export default {
  name: "tm-part",
  props: ["title"]
}
</script>

<style lang="stylus">
@require '~variables'

.tm-part
  position relative
  max-width width-main-max

.tm-part-container, .tm-part-header, .tm-part-title, .tm-part-menu, .tm-part-main
  &:empty
    display none

.tm-part-main
  padding-right 1rem

.tm-part-container
  margin 0 auto

.tm-part-header
  padding 0.5rem 1rem
  margin-bottom 0.5rem
  background var(--app-fg)

.tm-part-header-container
  display flex
  align-items center

.tm-part-title, .tm-part-menu
  color var(--dim)
  margin 0

  a
    color var(--link)

    &:hover
      color var(--hover)

.tm-part-title
  flex 1
  color var(--dim)
  font-size sm
  font-weight 400

@media screen and (min-width: 768px)
  .tm-part-container
    &:last-child
      padding-bottom 1.5rem
</style>
