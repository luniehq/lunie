<template lang='pug'>
header.app-header
  .container
    .header-item(@click="toggleMenuApp", v-if="!desktop")
      i.material-icons(v-if="!activeMenuApp") menu
      i.material-icons(v-else="") close
    router-link.header-item.header-item-link(to="/") {{ text.zoneName }}
    menu.menu-popup.menu-app(v-if="activeMenuApp || desktop")
      nav.nav-app
        router-link(to="/" @click.native="close") Index
        a(:href="text.zoneGithub" target="_blank" @click.native="close" v-if="desktop") GitHub
        a(:href="cosmos.website" target="_blank" @click.native="close") Cosmos Network
    a.header-item(:href="text.zoneGithub" target="_blank" v-if="!desktop")
      i.material-icons(v-if="!activeMenuApp") code
</template>

<script>
import { mapGetters } from 'vuex'
import disableScroll from 'disable-scroll'
export default {
  name: 'app-header',
  computed: {
    ...mapGetters(['text', 'cosmos'])
  },
  data: () => ({
    activeMenuApp: false,
    desktop: false
  }),
  methods: {
    close () {
      this.activeMenuApp = false
      this.activeMenuFundraiser = false
      disableScroll.off()
    },
    toggleMenuApp () {
      this.activeMenuApp = !this.activeMenuApp
      if (this.activeMenuApp) disableScroll.on()
      else disableScroll.off()
    },
    watchWindowSize () {
      let w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0)
      if (w >= 1024) {
        this.close()
        this.desktop = true
      } else {
        this.desktop = false
      }
    }
  },
  mounted () {
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
  border-bottom 1px solid bc-dim

  .container
    display flex
    flex-flow row wrap
    justify-content space-between

  .header-item
    height 3rem
    width 3rem
    display flex
    align-items center
    justify-content center

    color txt
    font-weight bold
    cursor pointer
    i.material-icons
      font-size lg

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
      > a, > p
        padding 0.75rem 0
      > a
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
      > p
        .ni-time-left
          display inline
          font-weight bold

@media screen and (min-width: 1024px)
  .app-header
    border-top bw solid darken(app-bg, 50%)
    height 3rem + bw

    .container
      .header-item
        border-top bw solid transparent
        margin-top -1 * bw
        height 3rem + bw
        position relative
        z-index 10

        width auto
        padding 0 1rem
        &:last-of-type
          justify-content flex-end

        &:hover
          color bright
          border-color hover

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
        padding 0 1rem
        color txt
        line-height 3rem
        height 3rem + bw
        border-top bw solid transparent
        margin-top -1 * bw

        &:hover
          color bright
          border-color hover

        &.router-link-active
          cursor default
          user-select none
          color bright
          border-color accent
          background app-fg
          &:hover
            color bright
</style>
