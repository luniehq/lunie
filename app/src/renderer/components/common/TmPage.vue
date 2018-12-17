<template lang="pug">
.tm-page
  tm-page-header
    h2(v-if="title", slot='title') {{ title }}
    h3(v-if="subtitle", slot='subtitle') {{ subtitle }}
    template(slot='menu-body'): slot(name="menu-body")
    div(slot="menu"): slot(name="menu")
  main.tm-page-main: slot
</template>

<script>
import PerfectScrollbar from "perfect-scrollbar"
import TmPageHeader from "../TmPageHeader/TmPageHeader.vue"
export default {
  name: "tm-page",
  props: {
    title: {
      type: String,
      default: ""
    },
    subtitle: {
      type: String,
      default: ""
    },
    "menu-body": {
      type: String,
      default: ""
    }
  },
  components: {
    TmPageHeader
  },
  data: () => ({ ps: "" }),
  async mounted() {
    await this.$nextTick()
    const container = this.$el.querySelector(".tm-page-main")
    this.ps = new PerfectScrollbar(container)
  }
}
</script>

<style lang="stylus">
@require '~variables'

.tm-page
  flex 1
  display flex
  flex-flow column nowrap
  position relative
  width 100%

.tm-page-main
  flex 1
  position relative

.tm-page-title
  color var(--bright)
  font-size h2
  padding 0.5rem 1rem 1rem

.tm-page-subtitle > div
  color var(--dim)
  font-size sm

@media screen and (min-width: 768px)
  .tm-page-main
    padding 1rem
</style>
