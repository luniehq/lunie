<template lang="pug">
.menu-locale-container
  overlay-btns
    overlay-btn(@click.native='toggle(true)', icon='close', v-if='maximized')
    overlay-btn(@click.native='toggle(true)', icon='language', v-else='')
  menu.menu-locale(v-show='maximized')
    router-link(to='/resources/whitepaper' exact) English
    router-link(to='/resources/whitepaper/zh-CN') 简体中文
    router-link(to='/resources/whitepaper/pt') Portuguese
    router-link(to='/resources/whitepaper/ko') Korean
</template>

<script>
import OverlayBtn from "buttons/OverlayBtn"
import OverlayBtns from "buttons/OverlayBtns"
export default {
  name: "menu-locale",
  components: {
    OverlayBtn,
    OverlayBtns
  },
  data: () => ({
    maximized: false
  }),
  methods: {
    toggle() {
      this.maximized = !this.maximized
    },
    set(value) {
      this.maximized = value
    }
  },
  props: ["path", "langs"]
}
</script>

<style lang="stylus">
@import '~variables'

.menu-locale-container
  position absolute

.menu-locale
  background app-fg
  shadow()

  position fixed
  bottom 4em
  right 0
  width 20rem
  z-index 100

  a
    display block
    line-height 3em
    border-bottom 1px solid bc
    padding 0 1.25rem
    cursor pointer
    color txt
    user-select none

    &:hover
      color link
    &.router-link-active
      color accent
    &:last-of-type
      border-bottom none

@media screen and (min-width:1024px)
  .menu-locale-container
    bottom 0.5rem
</style>
