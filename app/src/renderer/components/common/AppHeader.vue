<template lang='pug'>
nav#app-header(v-bind:class="{ mobile: !config.desktop, windows: isWin }"): .container
  template(v-if="!config.desktop")
    .header-item

  router-link.header-item.header-item-logo(to="/")
    img#logo-black(v-if="themes.active == 'light'"
      src="~@/assets/images/cosmos-wordmark-black.svg")
    img#logo-white(v-else
      src="~@/assets/images/cosmos-wordmark-white.svg")

  app-menu(v-if="config.activeMenu === 'app' || config.desktop")

  template(v-if="!config.desktop")
    .header-item(v-if="config.activeMenu === 'app'" @click="close")
      i.material-icons close
    .header-item(v-else @click="enableMenu()"): i.material-icons menu
</template>

<script>
import { mapGetters } from "vuex"
import noScroll from "no-scroll"
import AppMenu from "common/AppMenu"
export default {
  name: "app-header",
  components: { AppMenu },
  computed: {
    ...mapGetters(["config", "themes"]),
    isWin() {
      return navigator.platform.toUpperCase().indexOf("WIN") >= 0
    }
  },
  methods: {
    close() {
      this.$store.commit("setActiveMenu", "")
      noScroll.off()
    },
    enableMenu() {
      this.$store.commit("setActiveMenu", "app")
      noScroll.on()
    },
    watchWindowSize() {
      let w = Math.max(
        document.documentElement.clientWidth,
        window.innerWidth || 0
      )
      if (w >= 1024) {
        this.close()
        this.$store.commit("setConfigDesktop", true)
        return
      } else {
        this.$store.commit("setConfigDesktop", false)
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

#app-header
  z-index z(appHeader)
  .container
    -webkit-app-region drag

  &.windows:before
    display block
    content ''
    height px
    background var(--bc)
    width 100vw
    position absolute
    top 0
    left 0
    z-index z(appHeader)

@media screen and (max-width: 1023px)
  #app-header
    position fixed
    top 0
    left 0
    width 100%

    background var(--app-bg)

    > .container
      max-width aw
      margin 0 auto
      display flex
      flex-flow row nowrap
      border-bottom px solid var(--bc)
      justify-content space-between

    .header-item
      height 3rem - px
      width 3rem
      display flex
      align-items center
      justify-content center
      padding 0 1rem

      color var(--link)
      cursor pointer

      i.material-icons
        width 1rem
        font-size lg

      &.header-item-logo
        img
          height 1.5rem

@media screen and (min-width: 1024px)
  #app-header
    display flex
    flex 0 0 width-side
    min-width 0
    display flex

    > .container
      flex 1
      display flex
      flex-flow column nowrap

    .header-item-logo
      border-bottom px solid var(--bc)
      padding 2.5rem 1rem 1rem 1rem
      line-height normal
      img
        height 1.75rem
</style>
