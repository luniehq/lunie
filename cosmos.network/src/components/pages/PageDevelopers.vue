<template lang="pug">
.page
  page-menu
    router-link(:to="{ name: 'developers'}") Overview
    router-link(:to="{ name: 'scaling-eth'}") Scaling Ethereum
    router-link(:to="{ name: 'wallet'}") Wallet Development
    // router-link(:to="{ name: 'hackatom'}") HackAtom
  router-view
</template>

<script>
import PageMenu from "common/NiPageMenu"
export default {
  name: "page-developers",
  metaInfo: { title: "Developers" },
  components: {
    PageMenu
  }
}
</script>
