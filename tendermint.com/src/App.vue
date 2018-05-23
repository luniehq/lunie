<template lang="pug">
#app
  app-header
  #app-content: router-view
  app-footer
</template>

<script>
import AppHeader from "comp/AppHeader.vue"
import AppFooter from "comp/AppFooter.vue"
import store from "@/store/index.js"

export default {
  name: "app",
  components: {
    AppHeader,
    AppFooter
  },
  metaInfo: {
    link: [
      {
        rel: "apple-touch-icon",
        sizes: "180x180",
        href: "../public/apple-touch-icon.png"
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "32x32",
        href: "../public/favicon-32x32.png"
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "16x16",
        href: "../public/favicon-16x16.png"
      },
      { rel: "manifest", href: "../public/manifest.json" },
      {
        rel: "mask-icon",
        href: "../public/safari-pinned-tab.svg",
        color: "#15182d"
      }
    ],
    meta: [
      { charset: "utf-8" },
      { name: "description", content: "Website for Tendermint." },
      { name: "viewport", content: "width=device-width, user-scalable=no" },

      { name: "theme-color", content: "#ffffff" },

      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@tendermint_team" },
      {
        name: "twitter:title",
        content: "Tendermint - Blockchain Consensus"
      },
      {
        name: "twitter:description",
        content: "The blockchain consensus engine."
      },
      { name: "twitter:creator", content: "@cosmos" },
      { name: "twitter:image", content: "../public/media/bg-meta-twitter.jpg" },
      { name: "twitter:card", content: "summary_large_image" },

      {
        property: "og:title",
        content: "Tendermint - Blockchain Consensus"
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: window.location.href },
      { property: "og:image", content: "../public/media/bg-meta-facebook.jpg" },
      {
        property: "og:description",
        content: "The blockchain consensus engine."
      },
      { property: "og:site_name", content: "Tendermint" },
      { property: "fb:admins", content: "" }
    ],
    // if no subcomponents specify a metaInfo.title, this title will be used
    title: "Blockchain Consensus",
    // all titles will be injected into this template
    titleTemplate: "%s - Tendermint"
  },
  mounted() {
    this.$store.commit("initEcosystem")
    this.$store.commit("initializeContribute")
  },
  store
}
</script>

<style src="./styles/app.styl" lang="stylus"></style>
