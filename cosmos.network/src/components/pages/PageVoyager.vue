<template lang="pug">
.page
  page-menu
    router-link(:to="{ name: 'voyager'}") Overview
    router-link(:to="{ name: 'voyager-faq'}") FAQ
    router-link(:to="{ name: 'voyager-support'}") Support
    a(href="https://github.com/cosmos/voyager/releases")
      | Download #[i.fab.fa-github]
  router-view
</template>

<script>
import PageMenu from "common/NiPageMenu"
export default {
  name: "page-voyager",
  metaInfo: { title: "Voyager" },
  components: {
    PageMenu
  }
}
</script>
