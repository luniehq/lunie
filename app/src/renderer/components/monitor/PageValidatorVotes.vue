<template lang="pug">
page(icon="storage" :title="`${validatorId} Votes`")
  tool-bar
    router-link(to="/validators" exact): i.material-icons arrow_back
    a(@click='toggleSearch'): i.material-icons search

  part(title='Vote Statistics')
    list-item(dt="Voted Yes:" dd="27%")
    list-item(dt="Voted No:" dd="5%")
    list-item(dt="Voted Reject:" dd="4%")
    list-item(dt="Abstained:" dd="11%")
    list-item(dt="Did Not Vote:" dd="53%")

  part(title='Past Votes')
    list-item(title="Title of the proposal here" subtitle="Voted: YES" to="/proposal")
    list-item(title="Title of the proposal here" subtitle="Voted: NO" to="/proposal")
    list-item(title="Title of the proposal here" subtitle="Voted: REJECT" to="/proposal")
    list-item(title="Title of the proposal here" subtitle="Voted: YES." to="/proposal")
    list-item(title="Title of the proposal here" subtitle="Voted: NO" to="/proposal")
    list-item(title="Title of the proposal here" subtitle="Voted: YES." to="/proposal")
</template>

<script>
import { mapGetters } from 'vuex'
import ListItem from '../common/NiListItem'
import ToolBar from '../common/NiToolBar'
import Page from '../common/NiPage'
import Part from '../common/NiPart'
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
