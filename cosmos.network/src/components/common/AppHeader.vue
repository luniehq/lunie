<template lang='pug'>
header.app-header
  .container
    .header-item(@click='toggleMenuApp', v-if='!desktop')
      i.material-icons(v-if='!activeMenuApp') menu
      i.material-icons(v-else='') close
    router-link.header-item.header-item-link(to='/')
      img(src='~images/logos/cosmos-logo.png', alt='Cosmos Logo')
    .header-item(v-if='!desktop')
    menu.menu-popup.menu-app(v-if='activeMenuApp || desktop')
      nav
        router-link(to='/intro' @click.native='close') Introduction
        router-link(to='/testnet' @click.native='close') Testnet
        router-link(to='/roadmap' @click.native='close') Roadmap
        router-link(to='/community' @click.native='close') Community
        router-link(to='/developers' @click.native='close') Developers
        router-link(to='/validators' @click.native='close') Validators
        router-link(to='/resources' @click.native='close') Resources
      nav
        a(:href='links.cosmos.blog' @click.native='close' target='_blank')
          span.label Blog
          i.fab.fa-medium
</template>

<script>
import { mapGetters } from "vuex"
import disableScroll from "disable-scroll"
export default {
  name: "app-header",
  computed: {
    ...mapGetters(["config", "links"])
  },
  data: () => ({
    activeMenuApp: false,
    desktop: false
  }),
  methods: {
    close() {
      this.activeMenuApp = false
      this.activeMenuFundraiser = false
      disableScroll.off()
    },
    goto(route) {
      this.close()
      this.$router.push(route)
    },
    toggleMenuApp() {
      this.activeMenuApp = !this.activeMenuApp
      if (this.activeMenuApp) disableScroll.on()
      else disableScroll.off()
    },
    toggleMenuFundraiser() {
      this.activeMenuFundraiser = !this.activeMenuFundraiser
      if (this.activeMenuFundraiser) disableScroll.on()
      else disableScroll.off()
    },
    watchWindowSize() {
      let w = Math.max(
        document.documentElement.clientWidth,
        window.innerWidth || 0
      )
      if (w >= 1024) {
        this.close()
        this.desktop = true
      } else {
        this.desktop = false
      }
    }
  },
  mounted() {
    this.watchWindowSize()
    window.onresize = this.watchWindowSize
  }
}
</script>

<style lang="stylus">
@require '~variables'

.app-header
  position fixed
  top 0
  left 0
  z-index 100
  width 100vw
  background app-bg

  .container
    max-width 1024px
    margin 0 auto
    display flex
    flex-flow row wrap
    justify-content space-between

  .header-item
    height 3rem
    min-width 3rem
    display flex
    align-items center
    padding 0 1rem

    color txt
    cursor pointer

    i + .label
      margin-left 0.5rem
      user-select none

    i.material-icons
      font-size lg

    img
      display block
      height 2rem

    &:hover
      i, .label
        color bright

  .menu-app
    nav
      a
        display flex
        align-items center
        cursor pointer

  .menu-popup
    z-index 101
    user-select none

@media screen and (max-width:1023px)
  .menu-popup
    height 100vh
    position fixed
    top 3rem
    left 0
    bottom 0
    width 100vw

    background app-bg
    user-select none

    nav
      display flex
      flex-flow column
      padding 1.5rem 3rem
      > a
        padding 0.75rem 0
        color txt
        border-top 1px solid bc
        display flex
        align-items center
        justify-content space-between
        user-select none
        &.disabled
          color dim
          cursor not-allowed
        &:hover
          color hover

@media screen and (min-width: 1024px)
  .app-header
    border-bottom 1px solid app-fg
    border-top bw solid app-bg

    .container
      nav
        .header-item
          border-top bw solid transparent
          margin-top -1 * bw
          height 3rem + bw
          position relative
          z-index 10
          &:last-of-type
            justify-content flex-end

          &:hover
            color bright
            border-color hover

          &.header-item-link.router-link-exact-active
            background app-fg
            border-color mc

  .menu-popup.menu-app
    display flex
    padding 0 1rem

    .container
      display flex

    nav
      display flex
      flex-flow row
      align-items center

      > a
        padding 0 1.2rem
        color txt
        line-height 3rem
        height 3rem + bw
        border-top bw solid transparent
        margin-top -1 * bw

        i
          margin-left 0.5rem

        &:hover
          color bright
          border-color hover

        &.router-link-active
          cursor default
          user-select none
          color bright
          border-color var(--accent)
          background app-fg
          &:hover
            color bright
</style>
