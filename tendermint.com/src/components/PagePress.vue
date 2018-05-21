<template lang="pug">
page(title="Press Mentions" subtitle="Mentions in the news and media resources.")
  text-container
    card-post(v-for="media in orderedMedia" :key="media.title" :url="media.url"
        :title="media.title"  :desc="media.date + ' - '+ media.company")
</template>

<script>
import { mapGetters } from "vuex"
import { orderBy } from "lodash"
import CardPost from "./CardPost"
import Page from "common/NiPage"
import TextContainer from "common/NiTextContainer"
export default {
  name: "page-press",
  metaInfo: { title: "Press Mentions" },
  components: {
    CardPost,
    Page,
    TextContainer
  },
  computed: {
    orderedMedia() {
      return orderBy(this.media, ["date"], ["desc"])
    },
    ...mapGetters({
      media: "allMedia"
    })
  }
}
</script>
