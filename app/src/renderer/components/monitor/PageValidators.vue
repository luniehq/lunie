<template lang="pug">
page(title='Validators')
  modal-search(v-if="filters.validators.search.visible")
  tab-bar
    router-link(to="/validators" exact) Online ({{ online }})
    a Offline (0)
  tool-bar
    a(@click='setSearch(true)'): i.material-icons search
  list-item(
    v-for="v in filteredValidators"
    :key="v.node_info.moniker"
    :title="v.node_info.moniker"
    :subtitle="todoAtoms"
    icon='storage'
    :to="`/validators/${urlsafeIp(v.node_info.moniker)}`")
</template>

<script>
import { mapGetters } from 'vuex'
import { includes, orderBy } from 'lodash'
import ListItem from '../common/NiListItem'
import ModalSearch from '../common/ModalSearchValidators'
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
  data: () => ({
    todoAtoms: '13.37M ATOM'
  }),
  computed: {
    ...mapGetters(['validators', 'filters']),
    filteredValidators () {
      let query = this.filters.validators.search.query
      let list = orderBy(this.validators, ['node_info.moniker', 'desc'])
      if (this.filters.validators.search.visible) {
        return list.filter(v => includes(v.node_info.moniker.toLowerCase(), query))
      } else {
        return list
      }
    },
    online () { return this.validators.length }
  },
  methods: {
    setSearch (v) { this.$store.commit('setValidatorsSearchVisible', v) },
    urlsafeIp (ip) {
      return ip.split('.').join('-')
    }
  },
  mounted () {
    Mousetrap.bind(['command+f', 'ctrl+f'], () => this.setSearch(true))
    Mousetrap.bind('esc', () => this.setSearch(false))
  } 
}
</script>
