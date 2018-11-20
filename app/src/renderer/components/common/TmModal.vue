<template lang="pug">
div(:class='cssClass' @click.self="close()")
  .tm-modal-container
    header.tm-modal-header
      .tm-modal-icon(v-if='icon')
        i.material-icons {{ icon }}
      .tm-modal-title
        slot(name='title')
      .tm-modal-icon.tm-modal-close(@click="close()")
        i.material-icons(v-if="close") close
    main.tm-modal-main
      slot
      footer.tm-modal-footer
        slot(name='footer')
</template>

<script>
export default {
  name: `tm-modal`,
  props: {
    icon: {
      type: String,
      required: true
    },
    size: {
      type: String,
      required: true
    },
    close: {
      type: Function,
      required: true
    }
  },
  computed: {
    cssClass() {
      let value = `tm-modal`
      if (this.size === `fullscreen` || this.size === `fs`) {
        value += ` tm-modal-fullscreen`
      }
      return value
    }
  }
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

  b
    font-weight 500
    color var(--bright)

  &.tm-modal-fullscreen
    display flex

.tm-modal-container
  background var(--app-fg)
  box-shadow hsla(0,0,0,0.25) 0 0.25rem 1rem
  display flex
  flex-flow column nowrap
  width 30rem

.tm-modal-header
  display flex
  flex-flow row nowrap
  align-items center
  padding 1rem 1.5rem
  background var(--app-nav)

.tm-modal-icon
  display flex
  align-items center
  justify-content center
  i
    font-size lg

  &.tm-modal-close
    cursor pointer
    &:hover i
      color var(--link)

.tm-modal-title
  flex 1
  font-size h3
  font-weight 500
  color var(--bright)

.tm-modal-main
  padding 1rem 1.5rem
  display flex
  flex-flow column
  justify-content center

  .ps-scrollbar-y-rail
    display none

  p
    margin-bottom 1rem
    word-wrap break-word

.tm-modal-footer
  padding-top 2rem
  display flex
  justify-content flex-end
</style>
