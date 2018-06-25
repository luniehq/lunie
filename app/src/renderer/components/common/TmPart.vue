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
  background var(--app-bg-light)
  border-radius 2px
  margin 1rem 0

.tm-part-container, .tm-part-header, .tm-part-title, .tm-part-menu, .tm-part-main
  &:empty
    display none

<<<<<<< HEAD:app/src/renderer/components/common/TmPart.vue
.tm-part-main
  padding-right 1rem

.tm-part-container
  margin 0 auto

.tm-part-header
  padding 0.5rem 1rem
  margin-bottom 0.5rem
  background var(--app-fg)
=======
.ni-part-container
  margin 0 auto

.ni-part-header
  padding 1rem 1rem 0.5rem
  border-radius 2px
  background var(--app-bg-light)
>>>>>>> develop:app/src/renderer/components/common/NiPart.vue

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
<<<<<<< HEAD:app/src/renderer/components/common/TmPart.vue

@media screen and (min-width: 768px)
  .tm-part-container
    &:last-child
      padding-bottom 1.5rem
=======
>>>>>>> develop:app/src/renderer/components/common/NiPart.vue
</style>
