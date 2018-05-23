<template lang="pug">
page(title="Presentations" subtitle="Watch presentations and other videos about and by the Tendermint team.")
  text-container
    card-post(v-for='p in presentations' :key='p.title' :url="'/presentations/' + p.slug" :title='p.title' :desc='p.description' :meta='p.date')
</template>

<script>
import { mapGetters } from "vuex"
import { orderBy } from "lodash"
import CardPost from "./CardPost"
import Page from "common/NiPage"
import TextContainer from "common/NiTextContainer"
export default {
  name: "page-presentations-index",
  metaInfo: { title: "Presentations" },
  components: {
    CardPost,
    Page,
    TextContainer
  },
  computed: {
    presentations() {
      return orderBy(this.allPresentations, ["date"], ["desc"])
    },
    ...mapGetters({
      allPresentations: "allPresentations"
    })
  }
}
</script>
