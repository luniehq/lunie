<template>
<header class="app-header">
<div class="app-header-container">

  <router-link to="/" class="header-item header-item-logo">
    <img src="../assets/images/logo-cosmos-blue.png" alt="Cosmos Logo">
  </router-link>

  <div class="header-item" @click="toggleMenu" v-if="!desktop">
    <i v-if="!activeMenu" class="fa fa-bars"></i>
    <i v-else class="fa fa-times"></i>
  </div>

  <menu class="menu-popup menu-app" v-if="activeMenu || desktop" @click="hide">
    <nav class="nav-app">
      <router-link to="/" exact>Candidates</router-link>
      <template v-if="user.signedIn">
        <router-link to="/nominate" exact>Self-Nomination</router-link>
        <router-link to="/profile" exact>Profile</router-link>
      </template>
      <router-link v-else to="/signin" exact>Sign In</router-link>
    </nav>
  </menu>

</div>
</header>
</template>

<script>
import disableScroll from 'disable-scroll'
import { mapGetters } from 'vuex'
export default {
  name: 'app-header',
  computed: {
    ...mapGetters(['user'])
  },
  data: () => ({
    activeMenu: false,
    desktop: false
  }),
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
      if (w >= 640) {
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
  display flex
  flex-flow column nowrap
  height 3rem

.app-header-container
  flex 1
  display flex
  flex-flow row wrap
  justify-content space-between
  border-bottom 1px solid bc-dim

  .header-item
    min-width 3rem
    height 3rem
    display flex
    align-items center
    justify-content center

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
      height 1rem
      width auto

    &.header-item-logo
      padding 0 1rem

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
    top 3rem
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
      line-height 3rem
      border-bottom 1px solid bc-dim
      &:last-of-type
        border-bottom none

@media screen and (min-width:640px)
  .menu-app
    display flex
    height 3rem - px
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
