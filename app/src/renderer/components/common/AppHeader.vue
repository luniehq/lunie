<template lang='pug'>
nav#app-header: .container
  template(v-if="$route.path === '/' || config.desktop")
    router-link.header-item(to="/"): i.material-icons menu
  template(v-else)
    .header-item(v-if="config.activeMenu === 'app'" @click="close")
      i.material-icons close
    .header-item(v-else @click="enableMenu('app')"): i.material-icons menu

  router-link.header-item.header-item-logo(to="/") Cosmos Forum

  .header-item(v-if="config.activeMenu === 'user'" @click="close")
    i.material-icons close
  .header-item(v-else @click="enableMenu('user')"): i.material-icons person
</template>

<script>
import {mapGetters} from 'vuex'
import noScroll from 'no-scroll'
export default {
  name: 'app-header',
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
        this.$store.commit('setDesktop', true)
        return
      }
      this.$store.commit('setDesktop', false)
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
@require '~@/styles/variables.styl'

#app-header
  position fixed
  top 0
  left 0
  z-index 100
  width 100%

  background app-bg
  border-bottom 1px solid bc

  > .container
    max-width 1024px
    margin 0 auto
    display flex
    flex-flow row nowrap
    justify-content space-between

  .header-item
    height 3rem - px
    display flex
    align-items center
    justify-content center
    padding 0 1rem

    user-select none

    color link
    cursor pointer

    i.material-icons
      font-size 1.25rem

    &:hover
      color bright
      background app-fg

@media screen and (min-width: 1024px)
  #app-content
    max-width 1024px
    margin 0 auto
</style>
