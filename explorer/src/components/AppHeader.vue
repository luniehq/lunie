<template lang='pug'>
nav#app-header: .container
  template(v-if="!config.desktop")
    .header-item(v-if="config.activeMenu === 'app'" @click="close")
      i.material-icons close
    .header-item(v-else @click="enableMenu('app')"): i.material-icons menu

  router-link.header-item.header-item-logo(to="/")
    img(src="../assets/images/cosmos.png")
  app-menu(v-if="config.activeMenu === 'app' || config.desktop")

  template(v-if="!config.desktop")
    .header-item(v-if="config.activeMenu === 'user'" @click="close")
      i.material-icons close
    .header-item(v-else @click="enableMenu('user')"): i.material-icons settings
</template>

<script>
import { mapGetters } from 'vuex'
import noScroll from 'no-scroll'
import AppMenu from './AppMenu'
export default {
  name: 'app-header',
  components: {
    AppMenu
  },
  computed: {
    ...mapGetters(['config'])
  },
  methods: {
    close () {
      this.$store.commit('setActiveMenu', '')
      noScroll.off()
    },
    enableMenu (menuName) {
      this.$store.commit('setActiveMenu', menuName)
      noScroll.on()
    },
    watchWindowSize () {
      let w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0)
      if (w >= 1024) {
        this.close()
        this.$store.commit('SET_CONFIG_DESKTOP', true)
        return
      }
      this.$store.commit('SET_CONFIG_DESKTOP', false)
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

@media screen and (max-width: 1023px)
  #app-header
    position fixed
    top 0
    left 0
    z-index 100
    width 100%

    background app-bg

    > .container
      max-width 1024px
      margin 0 auto
      display flex
      flex-flow row nowrap
      border-bottom 1px solid bc
      justify-content space-between

    .header-item
      height 3rem - px
      display flex
      align-items center
      justify-content center
      padding 0 1rem

      color link
      cursor pointer

      i.material-icons
        width 1rem

      &:hover
        color link

      &.header-item-logo
        img
          height 1rem

sidebar-width = 16rem

@media screen and (min-width: 1024px)
  #app
    padding-top 0

  #app-header
    width sidebar-width
    border-right 1px solid bc
    position initial
    height 100vh
    display flex
    position fixed
    top 0
    left 0

    > .container
      flex 1

    .header-item-logo
      height 3rem
      border-bottom 1px solid bc
      display flex
      align-items center
      padding 0 1rem
      img
        height 1.25rem

  #app-content
    min-height 100vh
    margin-left sidebar-width

    display flex
    flex-flow column nowrap

  #app-main
    flex 1
</style>
