<template lang="pug">
#app
  app-header
  #app-content: router-view
  app-footer
  notifications(color='hsl(208,100%,25%)' :notifications='notifications')
</template>

<script>
import AppHeader from "common/AppHeader.vue"
import AppFooter from "common/AppFooter.vue"
import Notifications from "@nylira/vue-notifications"
import store from "@/store/index.js"
import { mapGetters } from "vuex"

export default {
  name: "app",
  components: {
    AppHeader,
    AppFooter,
    Notifications
  },
  computed: {
    ...mapGetters(["notifications"])
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
      { name: "description", content: "Website for the Cosmos Network." },
      { name: "viewport", content: "width=device-width, user-scalable=no" },

      { name: "theme-color", content: "#ffffff" },

      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@cosmos" },
      {
        name: "twitter:title",
        content: "Cosmos Network - Internet of Blockchains"
      },
      {
        name: "twitter:description",
        content:
          "The interoperable, scalable blockchain network. Built for developers."
      },
      { name: "twitter:creator", content: "@cosmos" },
      { name: "twitter:image", content: "../public/media/bg-meta-twitter.jpg" },
      { name: "twitter:card", content: "summary_large_image" },

      {
        property: "og:title",
        content: "Cosmos Network - Internet of Blockchains"
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: window.location.href },
      { property: "og:image", content: "../public/media/bg-meta-facebook.jpg" },
      {
        property: "og:description",
        content:
          "The interoperable, scalable blockchain network. Built for developers."
      },
      { property: "og:site_name", content: "Cosmos Network" },
      { property: "fb:admins", content: "" }
    ],
    // if no subcomponents specify a metaInfo.title, this title will be used
    title: "Internet of Blockchains",
    // all titles will be injected into this template
    titleTemplate: "%s - Cosmos Network"
  },
  mounted() {
    this.$store.commit("initializeLinks")
    this.$store.commit("initializeEvents")
    this.$store.commit("initializePeople")
    this.$store.commit("initializeBlog")
  },
  store
}
</script>

<style src="./styles/app.styl" lang="stylus"></style>
