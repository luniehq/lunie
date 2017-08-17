<template lang="pug">
page(:title="`${validatorId} Delegators`")
  tool-bar
    router-link(
      :to="{ name: 'validator', params: { validator: $route.params.validator }}")
      i.material-icons arrow_back
    a(@click='toggleSearch'): i.material-icons search

  part(title="Delegators / Time")
    | TODO: Chart

  part(title="Current Delegators (5)")
    list-item(title="Delegator Name" subtitle="137.4K ATOM" to="/delegators")
    list-item(title="Delegator Name" subtitle="137.4K ATOM" to="/delegators")
    list-item(title="Delegator Name" subtitle="137.4K ATOM" to="/delegators")
    list-item(title="Delegator Name" subtitle="137.4K ATOM" to="/delegators")
</template>

<script>
import { mapGetters } from 'vuex'
import ListItem from '../common/NiListItem'
import ToolBar from '../common/NiToolBar'
import Page from '../common/NiPage'
import Part from '../common/NiPart'
export default {
  name: 'page-validator-delegators',
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
