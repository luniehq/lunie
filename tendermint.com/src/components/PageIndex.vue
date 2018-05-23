<template lang="pug">
.page-index
  section-home-cover
  section-home-benefits
</template>

<script>
import SectionHomeCover from "comp/SectionHomeCover"
import SectionHomeBenefits from "comp/SectionHomeBenefits"
export default {
  name: "page-index",
  components: {
    SectionHomeCover,
    SectionHomeBenefits
  },
  head: {
    title() {
      return {
        inner: "Tendermint",
        separator: "-",
        complement: "Blockchain Consensus"
      }
    }
  }
}
</script>
