<template lang="pug">
page(:title="`${validatorId} Vote Power`")
  tool-bar
    router-link(
      :to="{ name: 'validator', params: { validator: $route.params.validator }}")
      i.material-icons arrow_back

  part(title='Vote Power / Time')
    | TODO: Chart

  part(title='Statistics')
    list-item(dt='Vote Power' dd='13.7M ATOM')
    list-item(dt='Power Rank' dd='#17')
</template>

<script>
import { mapGetters } from 'vuex'
import ListItem from '../common/NiListItem'
import ToolBar from '../common/NiToolBar'
import Page from '../common/NiPage'
import Part from '../common/NiPart'
export default {
  name: 'page-validator-power',
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
    slugToIp (slug) { return slug.split('-').join('.') }
  }
}
</script>
