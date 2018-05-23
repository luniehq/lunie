<template lang="pug">
.page
  page-menu
    router-link(:to="{name: 'resources'}") Overview
    router-link(:to="{name: 'whitepaper'}") Whitepaper
    router-link(:to="{name: 'faq'}") FAQ
    router-link(:to="{name: 'plan'}") Plan
    router-link(:to="{name: 'academy'}") Academy
    router-link(:to="{name: 'delegators'}") Delegators
  router-view
</template>

<script>
import PageMenu from "common/NiPageMenu"
export default {
  name: "page-resources",
  metaInfo: { title: "Resources" },
  components: {
    PageMenu
  }
}
</script>
