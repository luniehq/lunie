<template lang="pug">
page(icon="storage" :title="`${validatorId} Slashes`")
  tool-bar
    router-link(
      :to="{ name: 'validator', params: { validator: $route.params.validator }}")
      i.material-icons arrow_back
    a(@click='toggleSearch'): i.material-icons search

  part(title='Statistics')
    list-item(dt="Slashes" dd="7")
    list-item(dt="Percentage Slashed" dd="3%")
    list-item(dt="Last Slash:" dd="2 weeks ago%")

  part(title='Slashes')
    list-item(title="Title of the proposal here" subtitle="Slashed: 17%" to="/proposal")
    list-item(title="Title of the proposal here" subtitle="Slashed: 5%" to="/proposal")
    list-item(title="Title of the proposal here" subtitle="Slashed: 3%" to="/proposal")
    list-item(title="Title of the proposal here" subtitle="Slashed: 2%" to="/proposal")
    list-item(title="Title of the proposal here" subtitle="Slashed: 20%" to="/proposal")
</template>

<script>
import ListItem from '../common/NiListItem'
import ToolBar from '../common/NiToolBar'
import Page from '../common/NiPage'
import Part from '../common/NiPart'
export default {
  name: 'page-validator-slashes',
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
