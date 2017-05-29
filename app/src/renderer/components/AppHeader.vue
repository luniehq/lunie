<template>
<header class="app-header">

  <router-link to="/" class="header-item">
    <img src="../assets/images/logo-cosmos.png" alt="Cosmos Logo">
  </router-link>

  <div class="header-item" @click="toggleMenu" v-if="!desktop">
    <i v-if="!activeMenu" class="fa fa-bars"></i>
    <i v-else class="fa fa-times"></i>
  </div>

  <menu class="menu-popup menu-app" v-if="activeMenu || desktop" @click="hide">
    <nav class="nav-app">
      <router-link to="/">Delegation</router-link>
      <!--
      <router-link to="/" exact>Balances</router-link>
      <router-link to="/transactions">Transactions</router-link>
      <router-link to="/receive">Receive</router-link>
      <router-link to="/send">Send</router-link>
      -->
      <router-link to="/console">Console</router-link>
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
  border-bottom 1px solid bc
  display flex
  flex-flow row wrap
  justify-content space-between

  .header-item
    height 2.25rem
    display flex
    align-items center
    padding 0 1rem

    color txt
    cursor pointer
    &:hover
      color link

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

  .menu-app
    nav
      display flex
      a
        display flex
        align-items center
        cursor pointer
        i.fa
          margin-right 0.25rem
        img
          height 1rem
          margin-right 0.1rem

@media screen and (max-width:639px)
  .menu-popup
    height 100vh
    position fixed
    top 2.25rem
    left 0
    bottom 0
    width 100vw
    z-index 100000
    border-top 1px solid bc

    background c-app-bg
    user-select none

    nav
      display flex
      flex-flow column
      padding 2rem 3rem

      a
        padding 0.75rem 0
        color txt
        border-bottom 1px solid bc
        &:last-of-type
          border-bottom none
        &:hover
          color link

@media screen and (min-width:640px)
  .menu-app
    display flex
    padding 0 1rem
    nav
      display flex
      flex-flow row
      align-items center
      a
        height 2.25rem + 0.0625rem
        align-items center
        justify-content center
        display flex

        padding 0 1em

        border-bottom 1px solid bc
        border-left 1px solid bc
        margin-bottom -1px
        font-size 0.875rem
        font-weight 400
        color txt
        &:hover
          background darken(c-app-bg, 3%)
        &.router-link-active
          color txt
          background c-app-fg
          border-bottom-color c-app-fg
        i.fa
          display block
          margin-right 0.375rem
          color light
          display none

</style>
