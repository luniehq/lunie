<template lang="pug">
tm-page(icon="storage" :title="`${delegateId} Proposals`")
  div(slot="menu"): tool-bar
    router-link(v-tooltip.bottom="'Back'"
      :to="{ name: 'delegate', params: { delegate: $route.params.delegate }}")
      i.material-icons arrow_back
    a(@click='toggleSearch' v-tooltip.bottom="'Search'")
      i.material-icons search

  tm-part(title='Current Proposals')
    list-item(title="Title of the proposal here" subtitle="Live now" to="/proposal")

  tm-part(title='Past Proposals')
    list-item(title="Title of the proposal here" subtitle="Failed" to="/proposals")
    list-item(title="Title of the proposal here" subtitle="Passed" to="/proposals")
    list-item(title="Title of the proposal here" subtitle="Passed" to="/proposals")
    list-item(title="Title of the proposal here" subtitle="Spam" to="/proposals")
    list-item(title="Title of the proposal here" subtitle="Failed" to="/proposals")
    list-item(title="Title of the proposal here" subtitle="Failed" to="/proposals")
</template>

<script>
import ListItem from "common/NiListItem"
import ToolBar from "common/NiToolBar"
import { TmPage, TmPart } from "@tendermint/ui"
export default {
  name: "page-delegate-proposals",
  components: {
    ListItem,
    TmPage,
    TmPart,
    ToolBar
  },
  computed: {
    delegateId() {
      return this.slugToIp(this.$route.params.delegate)
    }
  },
  methods: {
    toggleSearch() {
      this.$store.commit("notify", { title: "Searching...", body: "TODO" })
    },
    slugToIp(slug) {
      return slug.split("-").join(".")
    }
  }
}
</script>
