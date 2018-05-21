<template>
  <div id="app">
    <app-header class="header"></app-header>
    <router-view></router-view>
    <app-footer></app-footer>
  </div>
</template>

<script>
import AppHeader from './components/AppHeader.vue'
import AppFooter from './components/AppFooter.vue'
import store from './store/index.js'

export default {
  components: {
    AppHeader,
    AppFooter,
    enRss: require('./assets/rss/en.xml'),
    koRss: require('./assets/rss/ko.xml')
  },
  head: {
    meta () {
      return [
        {n: 'charset', c: 'utf-8'},
        {
          n: 'description',
          c:
            'Cosmos is a project with an ambitious mission: To create a network of distributed ledgers that will solve long-standing problems in the cryptocurrency community.'
        },
        {n: 'twitter:card', c: 'summary'},
        {n: 'twitter:site', c: '@cosmos_hq'},
        {n: 'twitter:title', c: 'Cosmos - Internet of Blockchains'},
        {
          n: 'twitter:description',
          c:
            'Cosmos is a project with an ambitious mission: To create a network of distributed ledgers that will solve long-standing problems in the cryptocurrency community.'
        },
        {n: 'twitter:creator', c: '@cosmos_hq'},
        {
          p: 'twitter:image',
          c: require('./assets/favicon/apple-icon-180x180.png')
        },
        {p: 'og:title', c: 'Cosmos - Internet of Blockchains'},
        {p: 'og:type', c: 'website'},
        {p: 'og:url', c: window.location.href},
        {p: 'og:image', c: require('./assets/favicon/apple-icon-180x180.png')},
        {
          p: 'og:description',
          c:
            'Cosmos is a project with an ambitious mission: To create a network of distributed ledgers that will solve long-standing problems in the cryptocurrency community.'
        },
        {p: 'og:site_name', c: 'Cosmos - Internet of Blockchains'},
        {p: 'fb:admins', c: ''},
        {n: 'msapplication-TileColor', c: '#ffffff'},
        {
          n: 'msapplication-TileImage',
          c: require('./assets/favicon/ms-icon-144x144.png')
        },
        {n: 'theme-color', c: '#ffffff'}
      ]
    },
    link: [
      {
        r: 'alternate',
        t: 'application/rss+xml',
        h: require('./assets/rss/en.xml')
      },
      {
        r: 'apple-touch-icon',
        sz: '57x57',
        h: require('./assets/favicon/apple-icon-57x57.png')
      },
      {
        r: 'apple-touch-icon',
        sz: '60x60',
        h: require('./assets/favicon/apple-icon-60x60.png')
      },
      {
        r: 'apple-touch-icon',
        sz: '72x72',
        h: require('./assets/favicon/apple-icon-72x72.png')
      },
      {
        r: 'apple-touch-icon',
        sz: '76x76',
        h: require('./assets/favicon/apple-icon-76x76.png')
      },
      {
        r: 'apple-touch-icon',
        sz: '114x114',
        h: require('./assets/favicon/apple-icon-114x114.png')
      },
      {
        r: 'apple-touch-icon',
        sz: '120x120',
        h: require('./assets/favicon/apple-icon-120x120.png')
      },
      {
        r: 'apple-touch-icon',
        sz: '144x144',
        h: require('./assets/favicon/apple-icon-144x144.png')
      },
      {
        r: 'apple-touch-icon',
        sz: '152x152',
        h: require('./assets/favicon/apple-icon-152x152.png')
      },
      {
        r: 'apple-touch-icon',
        sz: '180x180',
        h: require('./assets/favicon/apple-icon-180x180.png')
      },
      {
        r: 'icon',
        t: 'image/png',
        sz: '192x192',
        h: require('./assets/favicon/android-icon-192x192.png')
      },
      {
        r: 'icon',
        t: 'image/png',
        sz: '32x32',
        h: require('./assets/favicon/favicon-32x32.png')
      },
      {
        r: 'icon',
        t: 'image/png',
        sz: '96x96',
        h: require('./assets/favicon/favicon-96x96.png')
      },
      {
        r: 'icon',
        t: 'image/png',
        sz: '16x16',
        h: require('./assets/favicon/favicon-16x16.png')
      },
      {r: 'manifest', h: require('./assets/favicon/manifest.json')}
    ]
  },
  store
}
</script>

<style src="./styles/app.styl" lang="stylus"></style>
