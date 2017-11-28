<template lang='pug'>
nav#app-header: .container
  template(v-if="!config.desktop")
    .header-item(v-if="config.activeMenu === 'app'" @click="close")
      i.material-icons close
    .header-item(v-else @click="enableMenu('app')"): i.material-icons menu

  router-link.header-item.header-item-logo(to="/")
    img(src="~@/assets/images/cosmos.png")
  app-menu(v-if="config.activeMenu === 'app' || config.desktop")
  // app-menu-user(v-if="config.activeMenu === 'user' || config.desktop")

  template(v-if="!config.desktop")
    .header-item
</template>

<script>
import { mapGetters } from 'vuex'
import noScroll from 'no-scroll'
import AppMenu from 'common/AppMenu'
import AppMenuUser from 'common/AppMenuUser'
export default {
  name: 'app-header',
  components: {
    AppMenu,
    AppMenuUser
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
@require '~variables'

@media screen and (max-width: 1023px)
  #app-header
    position fixed
    top 0
    left 0
    z-index 100
    width 100%

    background app-bg

    > .container
      max-width aw
      margin 0 auto
      display flex
      flex-flow row nowrap
      border-bottom px solid bc
      justify-content space-between

    .header-item
      height 3rem - px
      width 3rem
      display flex
      align-items center
      justify-content center
      padding 0 1rem

      color link
      cursor pointer

      i.material-icons
        width 1rem
        font-size lg

      &:hover
        color link

      &.header-item-logo
        font-size sm
        img
          height 1rem

@media screen and (min-width: 1024px)
  #app
    padding-top 0

  #app-header
    width width-side
    border-right px solid bc
    position initial
    height 100vh
    display flex
    position fixed
    top 0
    left 0

    > .container
      flex 1
      display flex
      flex-flow column nowrap

    .header-item-logo
      height 3rem
      border-bottom px solid bc
      display flex
      align-items center
      padding 0 1rem
      img
        height 1.25rem

  #app-content
    min-height 100vh
    margin-left width-side

    display flex
    flex-flow column nowrap

  #app-main
    flex 1
</style>
