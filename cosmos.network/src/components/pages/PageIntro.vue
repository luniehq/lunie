<template lang="pug">
.page
  page-menu
    router-link(:to="{ name: 'intro'}") Overview
    router-link(:to="{ name: 'intro-hub'}") Cosmos Hub
    router-link(:to="{ name: 'intro-further'}") Going Further
  router-view
</template>

<script>
import PageMenu from "common/NiPageMenu"
export default {
  name: "page-intro",
  metaInfo: { title: "Introduction" },
  components: {
    PageMenu
  }
}
</script>
