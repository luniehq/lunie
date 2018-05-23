<template lang="pug">
.page-index
  section-cover
  section-events
  section-what
  section-benefits
  section-blog
</template>

<script>
import SectionBlog from "sections/SectionBlog"
import SectionCover from "shared/sections/SectionCover"
import SectionEvents from "sections/SectionEvents"
import SectionWhat from "sections/SectionWhat"
import SectionBenefits from "sections/SectionBenefits"
export default {
  name: "page-index",
  metaInfo: { title: "Internet of Blockchains" },
  components: {
    SectionBlog,
    SectionCover,
    SectionEvents,
    SectionWhat,
    SectionBenefits
  }
}
</script>
