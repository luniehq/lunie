<template lang="pug">
div(:class='cssClass'): .ni-modal-container
  header.ni-modal-header
    .ni-modal-icon(v-if='icon')
      i(:class='iconCssClass')
    .ni-modal-title
      slot(name='title')
  main.ni-modal-main
    slot
  footer.ni-modal-footer
    slot(name='footer')
</template>

<script>
// import Ps from 'perfect-scrollbar'
export default {
  computed: {
    iconCssClass () {
      let value = 'fa fa-'
      if (this.icon) {
        value += this.icon
        if (this.icon === 'refresh') {
          value += ' fa-spin'
        }
      }
      return value
    },
    cssClass () {
      let value = 'ni-modal'
      if (this.size === 'fullscreen' || this.size === 'fs') {
        value += ' ni-modal-fullscreen'
      }
      return value
    }
  },
  methods: {
    close () {
      this.$destroy()
    }
  },
  mounted () {
    // Ps.initialize(document.querySelector('.ni-modal-main'))
  },
  props: ['size', 'icon']
}
</script>

<style lang="stylus">
@import '~variables'

.ni-modal
  position fixed
  top 0
  left 0
  z-index 1000

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
  background app-fg
  box-shadow hsla(0,0,0,0.25) 0 0.25rem 1rem

  max-width 30rem
  max-height 40rem
  
.ni-modal-header, .ni-modal-main
  border-bottom 1px solid bc

.ni-modal-header
  display flex
  align-items center
  flex 0 0 3rem + 0.0625rem
  backgrountr transparent

.ni-modal-main, .ni-modal-footer
  padding 1rem

.ni-modal-icon
  padding-left 1rem
  padding-right 0.5rem
  height 3rem
  display flex
  align-items center
  justify-content center

.ni-modal-icon + .ni-modal-title
  padding-left 0

.ni-modal-title
  flex 1
  font-weight 500
  padding 0 1rem

.ni-modal-close
  cursor pointer
  &:hover
    color link

.ni-modal-main
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
  flex 0 0 4.0625rem
.ni-modal-footer > div
  display flex
  justify-content space-between
</style>
