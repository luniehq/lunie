<template lang="pug">
.page
  page-menu
    router-link(:to="{ name: 'validators'}") Overview
    router-link(:to="{name: 'validator-faq'}") FAQ
    router-link(:to="{ name: 'testnet-tutorial'}") Testnet Tutorial
  router-view
</template>

<script>
import PageMenu from "common/NiPageMenu"
export default {
  name: "page-validators",
  metaInfo: { title: "Validators" },
  components: {
    PageMenu
  }
}
</script>
