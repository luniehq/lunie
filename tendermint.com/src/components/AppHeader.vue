<template lang='pug'>
header.app-header
  .container
    .header-item(@click='toggleMenuApp' v-if='!desktop')
      i.material-icons(v-if='!activeMenuApp') menu
      i.material-icons(v-else='') close
    router-link.header-item.header-item-flush(to='/')
      img(src='../assets/images/logo-green-88.jpg' alt='Tendermint logo')
    menu.menu-popup.menu-app(v-if='activeMenuApp || desktop')
      nav.nav-app
        router-link(to='/downloads' @click.native='close' exact) Downloads
        router-link(to='/security' @click.native='close' exact) Security
        router-link(to='/contribute' @click.native='close' exact) Contribute
        router-link(to='/careers' @click.native='close' exact) Careers
        router-link(to='/about' @click.native='close' exact) About
      nav.nav-external
        a(:href='links.tm.docs.index' target='_blank')
          | Docs #[i.material-icons book]
        a(:href='links.tm.blog' @click.native='close' target='_blank')
          | Blog #[i.fab.fa-medium]
    .header-item.header-item-alert
      router-link(to='/github' @click.native='close' exact)
        i.fab.fa-github
        span.label(v-if='desktop') GitHub
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
      disableScroll.off()
    },
    goto(route) {
      this.close()
      this.$router.push(route)
      return
    },
    toggleMenuApp() {
      this.activeMenuApp = !this.activeMenuApp
      if (this.activeMenuApp) disableScroll.on()
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
        return
      }
      this.desktop = false
      return
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

navc = #94c0ec

.app-header
  position fixed
  top 0
  left 0
  z-index 100
  width 100%

  background var(--app-bg-alpha)

  .container
    max-width 1024px
    margin 0 auto
    display flex
    flex-flow row wrap
    justify-content space-between

  .header-item
    height 3rem
    display flex
    align-items center
    padding 0 1rem

    color var(--txt)
    cursor pointer
    &:first-child
      padding-left 0
    &:hover
      color var(--link)

    i
      width 1rem
      text-align center
      position relative
    i + .label
      margin-left 0.5rem
    i, .label
      color var(--txt)

    .label
      user-select none

    img
      display block
      height 3rem
      width auto

    &:hover
      i.fa, .label
        color var(--link)

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

    background var(--app-fg)
    user-select none

    nav
      display flex
      flex-flow column
      padding 1.5rem 3rem

      > a, > p
        padding 0.75rem 0
      > a
        color var(--txt)
        border-bottom 1px solid var(--bc)
        display flex
        align-items center
        justify-content space-between
        user-select none
        &.disabled
          color var(--dim)
          cursor not-allowed
        &:hover
          color var(--link)

@media screen and (min-width: 1024px)
  .app-header
    .container
      .header-item
        padding 0 1.5rem
        &:first-child
          padding-left 0

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
        padding 0 1.25rem
        color var(--txt)
        line-height 3rem
        i
          margin-left 0.5rem
        &:hover
          color var(--link)
          i
            color var(--link)
        &.router-link-active
          background var(--app-fg)
          cursor default
          &:hover
            color var(--txt)
</style>
