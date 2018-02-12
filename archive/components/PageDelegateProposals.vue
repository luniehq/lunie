<template lang="pug">
page(icon="storage" :title="`${delegateId} Proposals`")
  div(slot="menu"): tool-bar
    router-link(
      :to="{ name: 'delegate', params: { delegate: $route.params.delegate }}")
      i.material-icons arrow_back
      .label Back
    a(@click='toggleSearch')
      i.material-icons search
      .label Search

  part(title='Current Proposals')
    list-item(title="Title of the proposal here" subtitle="Live now" to="/proposal")

  part(title='Past Proposals')
    list-item(title="Title of the proposal here" subtitle="Failed" to="/proposals")
    list-item(title="Title of the proposal here" subtitle="Passed" to="/proposals")
    list-item(title="Title of the proposal here" subtitle="Passed" to="/proposals")
    list-item(title="Title of the proposal here" subtitle="Spam" to="/proposals")
    list-item(title="Title of the proposal here" subtitle="Failed" to="/proposals")
    list-item(title="Title of the proposal here" subtitle="Failed" to="/proposals")
</template>

<script>
import ListItem from 'common/NiListItem'
import ToolBar from 'common/NiToolBar'
import Page from 'common/NiPage'
import Part from 'common/NiPart'
export default {
  name: 'page-delegate-proposals',
  components: {
    ListItem,
    Page,
    Part,
    ToolBar
  },
  computed: {
    delegateId () { return this.slugToIp(this.$route.params.delegate) }
  },
  methods: {
    toggleSearch () {
      this.$store.commit('notify', { title: 'Searching...', body: 'TODO' })
    },
    slugToIp (slug) { return slug.split('-').join('.') }
  }
}
</script>
