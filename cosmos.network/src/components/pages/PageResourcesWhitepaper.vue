<template lang="pug">
toc-page(:toc-visible="whitepaperTocVisible")
  nav-contents(slot="nav" text-id="whitepaper")
  text-ko(v-if="$route.params.locale === 'ko'")
  text-pt(v-else-if="$route.params.locale === 'pt'")
  text-zh-cn(v-else-if="$route.params.locale === 'zh-CN'")
  text-en-us(v-else)
</template>

<script>
import { mapGetters } from "vuex"
import NavContents from "navigation/NavContents"
import PageMenu from "common/NiPageMenu"
import TextEnUs from "content/whitepaper.md"
import TextKo from "content/whitepaper-ko.md"
import TextPt from "content/whitepaper-pt.md"
import TextZhCn from "content/whitepaper-zh-CN.md"
import TocPage from "navigation/TocPage"
export default {
  name: "page-resources-whitepaper",
  metaInfo: { title: "Whitepaper - Resources" },
  components: {
    NavContents,
    PageMenu,
    TextEnUs,
    TextKo,
    TextPt,
    TextZhCn,
    TocPage
  },
  computed: { ...mapGetters(["whitepaperTocVisible"]) },
  mounted() {
    if (document.documentElement.clientWidth >= 1024) {
      this.$store.commit("setTocVisible", { id: "whitepaper", visible: true })
    }
  }
}
</script>
