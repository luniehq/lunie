<template lang="pug">
div(:class='cssClass' @click="close()")
  .ni-modal-container
    header.ni-modal-header
      .ni-modal-icon(v-if='icon')
        i.material-icons {{ icon }}
      .ni-modal-title
        slot(name='title')
      .ni-modal-icon.ni-modal-close(@click="close()")
        i.material-icons close
    main.ni-modal-main
      slot
    footer.ni-modal-footer
      slot(name='footer')
</template>

<script>
export default {
  computed: {
    cssClass () {
      let value = 'ni-modal'
      if (this.size === 'fullscreen' || this.size === 'fs') {
        value += ' ni-modal-fullscreen'
      }
      return value
    }
  },
  props: ['size', 'icon', 'close']
}
</script>

<style lang="stylus">
@import '~variables'

.ni-modal
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

  &.ni-modal-fullscreen
    display flex

    .ni-modal-container
      flex 1
      height 100vh
      max-height 100vh
      max-width 40rem + 6rem
      display flex
      flex-flow column nowrap

      .ni-modal-main
        flex 1
        overflow-y scroll
        display block

.ni-modal-container
  background var(--app-bg)
  box-shadow hsla(0,0,0,0.25) 0 0.25rem 1rem

  display flex
  flex-flow column nowrap

  min-width 20rem
  min-height 20rem

  max-width 30rem
  max-height 40rem

.ni-modal-header
  display flex
  flex-flow row nowrap
  align-items center
  flex 0 0 3rem + 0.0625rem
  background var(--app-fg)

.ni-modal-icon
  height 3rem
  flex 0 0 3rem
  display flex
  align-items center
  justify-content center

  i
    font-size lg
  &.ni-modal-close
    cursor pointer
    i
      color var(--link)
    &:hover i
      color var(--hover)

.ni-modal-icon + .ni-modal-title
  padding-left 0

.ni-modal-title
  flex 1
  font-size h3
  color var(--bright)
  padding 0 1rem

.ni-modal-main, .ni-modal-footer
  padding 1rem

.ni-modal-main + .ni-modal-footer
  border-top px solid var(--bc)

.ni-modal-main
  flex 1
  display flex
  flex-flow column
  justify-content center

  .ps-scrollbar-y-rail
    display none

.ni-modal-main p
  margin-bottom 1rem

.ni-modal-main > .ni-article-body
  margin -1rem

.ni-modal-footer
  flex 0 0 4rem + px
  &:empty
    display none

.ni-modal-footer > div
  display flex
  justify-content space-between
</style>
