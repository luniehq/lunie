<template lang="pug">
page(title='Validators')
  list-item(
    v-for="val in validators"
    icon='storage'
    :key="val.address"
    :subtitle="`Voting Power: ${val.voting_power}`"
    :title="val.address"
    :to="'#'")
</template>

<script>
import { mapGetters } from 'vuex'
import { includes, orderBy } from 'lodash'
import Mousetrap from 'mousetrap'
import ListItem from '../common/NiListItem'
import ModalSearch from '../common/ModalSearch'
import Page from '../common/NiPage'
import TabBar from '../common/NiTabBar'
import ToolBar from '../common/NiToolBar'
export default {
  name: 'page-validators',
  components: {
    ListItem,
    ModalSearch,
    Page,
    TabBar,
    ToolBar
  },
  computed: {
    ...mapGetters(['validators', 'filters']),
    online () { return this.validators.length }
  },
  methods: {
    setSearch (bool) { this.$store.commit('setSearchVisible', ['validators', bool]) },
    urlsafeIp (ip) { return ip.split('.').join('-') }
  },
  mounted () {
    Mousetrap.bind(['command+f', 'ctrl+f'], () => this.setSearch(true))
    Mousetrap.bind('esc', () => this.setSearch(false))
  }
}
</script>
