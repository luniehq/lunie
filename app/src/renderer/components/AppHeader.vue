<template>
<header class="app-header">

  <router-link to="/" class="header-item header-item-logo">
    Cosmos
  </router-link>

  <div class="header-item" @click="toggleMenu" v-if="!desktop">
    <i v-if="!activeMenu" class="fa fa-bars"></i>
    <i v-else class="fa fa-times"></i>
  </div>

  <menu class="menu-popup menu-app" v-if="activeMenu || desktop" @click="hide">
    <nav class="nav-app">
      <router-link to="/welcome" exact>Welcome</router-link>
      <router-link to="/signin" exact>Sign In</router-link>
      <router-link to="/profile" exact>Profile</router-link>
      <router-link to="/" exact>Candidates</router-link>
      <router-link to="/nominate" exact>Nominate</router-link>
      <router-link to="/invite" exact>Invite</router-link>
    </nav>
  </menu>

</header>
</template>

<script>
import disableScroll from 'disable-scroll'
export default {
  name: 'app-header',
  data () {
    return {
      activeMenu: false,
      desktop: false
    }
  },
  methods: {
    hide () {
      this.activeMenu = false
    },
    closeMenus () {
      this.activeMenu = false
      this.activeMenuUser = false
      disableScroll.off()
    },
    toggleMenu () {
      this.activeMenu = !this.activeMenu
      if (this.activeMenu) disableScroll.on()
      else disableScroll.off()
    },
    watchWindowSize () {
      let w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0)
      if (w >= 480) {
        this.closeMenus()
        this.desktop = true
        return
      }
      this.desktop = false
      return
    }
  },
  mounted () {
    this.watchWindowSize()
    window.onresize = this.watchWindowSize
  }
}
</script>

<style lang="stylus">
@require '../styles/variables.styl'

.app-header
  border-bottom 1px solid bc
  display flex
  flex-flow row wrap
  justify-content space-between
  margin 0 1rem

  .header-item
    height 2rem - px
    display flex
    align-items center

    color txt
    cursor pointer
    &:hover
      color bright


    i.fa
      font-size 0.875rem
      width 1rem
      text-align center
    i.fa + div
      margin-left 0.25rem

    img
      display block
      height 0.875rem
      width auto

    &.header-item-logo
      font-weight bold
      text-transform uppercase
      font-size 0.75rem
      color txt
      letter-spacing 0.125em

  .menu-app
    nav
      display flex
      a
        font-label()
        color dim
        display flex
        align-items center
        cursor pointer
        i.fa
          margin-right 0.25rem

        img
          height 1rem
          margin-right 0.1rem

        &.router-link-active
          color bright
          &:before
            background bc-vivid

@media screen and (max-width:639px)
  .menu-popup
    height 100vh
    position fixed
    top 2rem
    left 0
    bottom 0
    width 100vw
    z-index 100000

    background c-app-bg url('../assets/images/background-grid.png')
    user-select none

    padding 0 1rem

    nav
      display flex
      flex-flow column
      padding 1rem 0

      a
        height 3rem
        border-bottom 1px solid bc-dim
        &:last-of-type
          border-bottom none

@media screen and (min-width:640px)
  .menu-app
    display flex
    nav
      display flex
      flex-flow row
      align-items center
      a
        padding-right 1rem
        align-items center
        justify-content center
        display flex
        &:before
          content ''
          width 0.5rem
          height 1rem
          background bc-dim
          margin-right 0.5rem

        &.router-link-active
          color bright
          &:before
            background bc-vivid
</style>
