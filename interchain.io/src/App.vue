<template lang="pug">
#app: router-view
</template>

<script>
export default {
  name: 'app',
  metaInfo: {
    link: [
      { rel: 'apple-touch-icon', sizes: '57x57', href: '../static/favicons/apple-icon-57x57.png' },
      { rel: 'apple-touch-icon', sizes: '60x60', href: '../static/favicons/apple-icon-60x60.png' },
      { rel: 'apple-touch-icon', sizes: '72x72', href: '../static/favicons/apple-icon-72x72.png' },
      { rel: 'apple-touch-icon', sizes: '76x76', href: '../static/favicons/apple-icon-76x76.png' },
      { rel: 'apple-touch-icon', sizes: '114x114', href: '../static/favicons/apple-icon-114x114.png' },
      { rel: 'apple-touch-icon', sizes: '120x120', href: '../static/favicons/apple-icon-120x120.png' },
      { rel: 'apple-touch-icon', sizes: '144x144', href: '../static/favicons/apple-icon-144x144.png' },
      { rel: 'apple-touch-icon', sizes: '152x152', href: '../static/favicons/apple-icon-152x152.png' },
      { rel: 'apple-touch-icon', sizes: '180x180', href: '../static/favicons/apple-icon-180x180.png' },
      { rel: 'icon', type: 'image/png', sizes: '192x192', href: '../static/favicons/android-icon-192x192.png' },
      { rel: 'icon', type: 'image/png', sizes: '32x32', href: '../static/favicons/favicon-32x32.png' },
      { rel: 'icon', type: 'image/png', sizes: '96x96', href: '../static/favicons/favicon-96x96.png' },
      { rel: 'icon', type: 'image/png', sizes: '16x16', href: '../static/favicons/favicon-16x16.png' },
      { rel: 'manifest', href: '../static/favicons/manifest.json' }
    ],
    meta: [
      { charset: 'utf-8' },
      { name: 'description', content: 'Website for the Interchain Foundation.' },
      { name: 'viewport', content: 'width=device-width, user-scalable=no' },
      { name: 'msapplication-TileColor', content: '#ffffff' },
      { name: 'msapplication-TileImage', content: './ms-icon-144x144.png' },
      { name: 'theme-color', content: '#ffffff' }
    ],
    // if no subcomponents specify a metaInfo.title, this title will be used
    title: 'Interchain Foundation - Internet of Blockchains',
    // all titles will be injected into this template
    titleTemplate: '%s - Interchain Foundation'
  }
}
</script>

<style src="./styles/app.css"></style>
