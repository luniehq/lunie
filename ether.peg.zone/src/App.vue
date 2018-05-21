<template lang="pug">
#app
  app-header
  #app-content: router-view
  app-footer
</template>

<script>
import AppHeader from 'common/AppHeader.vue'
import AppFooter from 'common/AppFooter.vue'
import store from './store/index.js'
import { mapGetters } from 'vuex'

export default {
  name: 'app',
  components: {
    AppHeader,
    AppFooter
  },
  computed: { ...mapGetters(['text']) },
  head: {
    meta () {
      return [
        { n: 'description', c: this.text.siteDescription },

        { n: 'msapplication-TileColor', c: '#ffffff' },
        { n: 'msapplication-TileImage', c: require('./assets/favicon/ms-icon-144x144.png') },
        { n: 'theme-color', c: '#ffffff' }
      ]
    },
    link: [
      { r: 'apple-touch-icon', sz: '57x57', h: require('./assets/favicon/apple-icon-57x57.png') },
      { r: 'apple-touch-icon', sz: '60x60', h: require('./assets/favicon/apple-icon-60x60.png') },
      { r: 'apple-touch-icon', sz: '72x72', h: require('./assets/favicon/apple-icon-72x72.png') },
      { r: 'apple-touch-icon', sz: '76x76', h: require('./assets/favicon/apple-icon-76x76.png') },
      { r: 'apple-touch-icon', sz: '114x114', h: require('./assets/favicon/apple-icon-114x114.png') },
      { r: 'apple-touch-icon', sz: '120x120', h: require('./assets/favicon/apple-icon-120x120.png') },
      { r: 'apple-touch-icon', sz: '144x144', h: require('./assets/favicon/apple-icon-144x144.png') },
      { r: 'apple-touch-icon', sz: '152x152', h: require('./assets/favicon/apple-icon-152x152.png') },
      { r: 'apple-touch-icon', sz: '180x180', h: require('./assets/favicon/apple-icon-180x180.png') },
      { r: 'icon', t: 'image/png', sz: '192x192', h: require('./assets/favicon/android-icon-192x192.png') },
      { r: 'icon', t: 'image/png', sz: '32x32', h: require('./assets/favicon/favicon-32x32.png') },
      { r: 'icon', t: 'image/png', sz: '96x96', h: require('./assets/favicon/favicon-96x96.png') },
      { r: 'icon', t: 'image/png', sz: '16x16', h: require('./assets/favicon/favicon-16x16.png') },
      { r: 'manifest', h: require('./assets/favicon/manifest.json') }
    ]
  },
  store
}
</script>

<style src="./styles/app.styl" lang="stylus"></style>
