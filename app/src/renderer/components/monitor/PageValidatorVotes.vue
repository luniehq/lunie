<template lang="pug">
page(icon="storage" :title="`${validatorId}`" subtitle="Votes")
  div(slot="menu"): tool-bar
    router-link(
      :to="{ name: 'validator-index', params: { validator: $route.params.validator }}")
      i.material-icons arrow_back
      .label Back
    a(@click='toggleSearch')
      i.material-icons search
      .label Search

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
import ListItem from 'common/NiListItem'
import ToolBar from 'common/NiToolBar'
import Page from 'common/NiPage'
import Part from 'common/NiPart'
export default {
  name: 'page-validator-votes',
  components: {
    ListItem,
    Page,
    Part,
    ToolBar
  },
  computed: {
    validatorId () { return this.slugToIp(this.$route.params.validator) }
  },
  methods: {
    toggleSearch () {
      this.$store.commit('notify', { title: 'Searching...', body: 'TODO' })
    },
    slugToIp (slug) { return slug.split('-').join('.') }
  }
}
</script>
