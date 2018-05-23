<template lang="pug">
.page-index
  section-cover
  section-benefits
</template>

<script>
import { mapGetters } from 'vuex'
import SectionCover from 'sections/SectionCover'
import SectionBenefits from 'sections/SectionBenefits'
export default {
  name: 'page-index',
  components: {
    SectionCover,
    SectionBenefits
  },
  computed: { ...mapGetters(['text']) },
  head: {
    title () {
      return {
        inner: this.text.zoneName,
        separator: '-',
        complement: 'Cosmos Zone'
      }
    }
  }
}
</script>
