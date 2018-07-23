<template lang="pug">
div(:class='cssClass' @click.self="close()")
  .tm-modal-container
    header.tm-modal-header
      .tm-modal-icon(v-if='icon')
        i.material-icons {{ icon }}
      .tm-modal-title
        slot(name='title')
      .tm-modal-icon.tm-modal-close(@click="close()")
        i.material-icons close
    main.tm-modal-main
      slot
    footer.tm-modal-footer
      slot(name='footer')
</template>

<script>
export default {
  computed: {
    cssClass() {
      let value = "tm-modal"
      if (this.size === "fullscreen" || this.size === "fs") {
        value += " tm-modal-fullscreen"
      }
      return value
    }
  },
  props: ["size", "icon", "close"]
}
</script>

<style lang="stylus">
@import '~variables'

.tm-modal
  position fixed
  top 0
  left 0
  z-index z(modal)

  width 100vw
  height 100vh
  background hsla(0,0,0,0.5)

  display flex
  justify-content center
  align-items center
  backdrop-filter blur(0.5em)

  &.tm-modal-fullscreen
    display flex

    .tm-modal-container
      flex 1
      height 100vh
      max-height 100vh
      max-width 40rem + 6rem
      display flex
      flex-flow column nowrap

      .tm-modal-main
        flex 1
        overflow-y scroll
        display block

.tm-modal-container
  background var(--app-fg)
  box-shadow hsla(0,0,0,0.25) 0 0.25rem 1rem

  display flex
  flex-flow column nowrap

  min-width 20rem
  min-height 20rem

  max-width 30rem
  max-height 40rem

.tm-modal-header
  display flex
  flex-flow row nowrap
  align-items center
  flex 0 0 3rem + 0.0625rem
  background var(--app-nav)

.tm-modal-icon
  height 3rem
  flex 0 0 3rem
  display flex
  align-items center
  justify-content center

  i
    font-size lg
  &.tm-modal-close
    cursor pointer
    i
      color var(--link)
    &:hover i
      color var(--hover)

.tm-modal-icon + .tm-modal-title
  padding-left 0

.tm-modal-title
  flex 1
  font-size h3
  color var(--txt)
  padding 0 1rem

.tm-modal-main, .tm-modal-footer
  padding 1rem

.tm-modal-main + .tm-modal-footer
  border-top px solid var(--bc)

.tm-modal-main
  flex 1
  display flex
  flex-flow column
  justify-content center

  .ps-scrollbar-y-rail
    display none

.tm-modal-main p
  margin-bottom 1rem

.tm-modal-main > .tm-article-body
  margin -1rem

.tm-modal-footer
  flex 0 0 4rem + px
  &:empty
    display none

.tm-modal-footer > div
  display flex
  justify-content space-between
</style>
