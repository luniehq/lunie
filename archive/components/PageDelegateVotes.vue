<template lang="pug">
tm-page(icon="storage" :title="delegate.description.moniker" subtitle="Votes")
  div(slot="menu"): tool-bar
    router-link(v-tooltip.bottom="'Back'"
      :to="{ name: 'delegate', params: { delegate: $route.params.delegate }}")
      i.material-icons arrow_back
    a(@click='toggleSearch' v-tooltip.bottom="'Search'")
      i.material-icons search

  part(title='Vote Statistics')
    list-item(dt="Voted Yes:" dd="27%")
    list-item(dt="Voted No:" dd="5%")
    list-item(dt="Voted Reject:" dd="4%")
    list-item(dt="Abstained:" dd="11%")
    list-item(dt="Did Not Vote:" dd="53%")

  part(title='Past Votes')
    list-item(title="Title of the proposal here" subtitle="YES" to="/proposals")
    list-item(title="Title of the proposal here" subtitle="NO" to="/proposals")
    list-item(title="Title of the proposal here" subtitle="REJECT" to="/proposals")
    list-item(title="Title of the proposal here" subtitle="YES" to="/proposals")
    list-item(title="Title of the proposal here" subtitle="NO" to="/proposals")
    list-item(title="Title of the proposal here" subtitle="YES" to="/proposals")
</template>

<script>
import { mapGetters } from "vuex"
import ListItem from "common/NiListItem"
import ToolBar from "common/NiToolBar"
import { TmPage } from "@tendermint/ui"
import Part from "common/NiPart"
export default {
  name: "page-delegate-votes",
  components: {
    ListItem,
    TmPage,
    Part,
    ToolBar
  },
  computed: {
    ...mapGetters(["delegates"]),
    delegate() {
      let value = { description: { moniker: "Loading..." } }
      if (this.delegates && this.$route.params.delegate) {
        value =
          this.delegates.find(v => v.id === this.$route.params.delegate) ||
          value
      }
      return value
    }
  },
  methods: {
    toggleSearch() {
      this.$store.commit("notify", { title: "Searching...", body: "TODO" })
    }
  },
  async mounted() {
    console.log(this.$route.params.delegate)
    await this.$nextTick()
    console.log(this.delegate)
  }
}
</script>
