<template lang="pug">
page(icon="storage" :title="`${delegateId} Slashes`")
  div(slot="menu"): tool-bar
    router-link(
      :to="{ name: 'delegate', params: { delegate: $route.params.delegate }}")
      i.material-icons arrow_back
      .label Back
    a(@click='toggleSearch')
      i.material-icons search
      .label Search

  part(title='Statistics')
    list-item(dt="Slashes" dd="7")
    list-item(dt="Percentage Slashed" dd="3%")
    list-item(dt="Last Slash:" dd="2 weeks ago")

  part(title='Slashes')
    list-item(title="Title of the proposal here" subtitle="Slashed: 17%" to="/proposals")
    list-item(title="Title of the proposal here" subtitle="Slashed: 5%" to="/proposals")
    list-item(title="Title of the proposal here" subtitle="Slashed: 3%" to="/proposals")
    list-item(title="Title of the proposal here" subtitle="Slashed: 2%" to="/proposals")
    list-item(title="Title of the proposal here" subtitle="Slashed: 20%" to="/proposals")
</template>

<script>
import ListItem from "common/NiListItem"
import ToolBar from "common/NiToolBar"
import Page from "common/NiPage"
import Part from "common/NiPart"
export default {
  name: "page-delegate-slashes",
  components: {
    ListItem,
    Page,
    Part,
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
