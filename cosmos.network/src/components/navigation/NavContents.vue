<template lang="pug">
.nav-contents: overlay-btns
  menu-locale(
    v-if="textId === 'whitepaper'"
    path='whitepaper'
    :langs="['en-US', 'ko', 'pt', 'zh-CN']")
  overlay-btn(
    v-show='!tocVisible'
    @click.native='setTocVisible(true)'
    icon='format_list_numbered')
  overlay-btn.mobile-only(
    v-show='tocVisible'
    @click.native='setTocVisible(false)'
    icon='close')
  overlay-btn.print-btn(
    v-if="textId === 'whitepaper'"
    @click.native='downloadWhitepaper()'
    icon='file_download')
</template>

<script>
import { mapGetters } from "vuex"
import PerfectScrollbar from "perfect-scrollbar"
import watchTocClicks from "scripts/watchTocClicks.js"
import inViewport from "scripts/inViewport.js"
import visibleTocActivate from "scripts/visibleTocActivate.js"
import percentageScrolling from "scripts/percentageScrolling.js"
import MenuLocale from "navigation/MenuLocale"
import OverlayBtns from "buttons/OverlayBtns"
import OverlayBtn from "buttons/OverlayBtn"
export default {
  name: "nav-contents",
  components: {
    MenuLocale,
    OverlayBtns,
    OverlayBtn
  },
  computed: {
    ...mapGetters([
      "faqTocVisible",
      "faqElementsVisible",
      "whitepaperTocVisible",
      "whitepaperElementsVisible"
    ]),
    elementsVisible() {
      let value
      switch (this.textId) {
        case "whitepaper":
          value = this.whitepaperElementsVisible
          break
        case "faq":
          value = this.faqElementsVisible
          break
      }
      return value
    },
    tocVisible() {
      let value
      switch (this.textId) {
        case "whitepaper":
          value = this.whitepaperTocVisible
          break
        case "faq":
          value = this.faqTocVisible
          break
      }
      return value
    }
  },
  data: () => ({ ps: "" }),
  methods: {
    downloadWhitepaper() {
      window.location.href =
        "https://github.com/tendermint/aib-data/raw/master/pdf/cosmos-whitepaper.pdf"
    },
    setTocVisOnWidth() {
      let width = document.documentElement.clientWidth
      if (width >= 1024) {
        this.setTocVisible(true)
      } else {
        this.setTocVisible(false)
      }
    },
    setTocVisible(value) {
      if (value) {
        document.querySelector(".minimal-toc").style.display = "block"
        this.initToc()
      } else {
        document.querySelector(".minimal-toc").style.display = "none"
        this.destroyToc()
      }
    },
    initToc() {
      let container = document.querySelector(".minimal-toc")
      this.ps = new PerfectScrollbar(container)
      this.$store.commit("setTocVisible", { id: this.textId, visible: true })
      watchTocClicks(this.setTocVisible)
      this.$store.commit("setElementsVisible", {
        id: this.textId,
        els: inViewport(document.querySelectorAll("h2, h3, h4, h5"))
      })
      percentageScrolling()
    },
    destroyToc() {
      if (this.ps) {
        this.ps.destroy()
        this.$store.commit("setTocVisible", { id: this.textId, visible: false })
      }
    }
  },
  mounted() {
    this.setTocVisOnWidth()
  },
  props: ["text-id"],
  watch: {
    elementsVisible() {
      visibleTocActivate(this.elementsVisible)
    },
    "$route.params.locale"() {
      setTimeout(() => this.setTocVisOnWidth(), 100)
    }
  }
}
</script>
