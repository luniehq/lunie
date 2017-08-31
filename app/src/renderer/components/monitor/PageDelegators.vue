<template lang='pug'>
page(title='Delegators')
  modal-search(v-if="filters.delegators.search.visible")
  tab-bar
    router-link(to="/delegators" exact) Online ({{ online }})
    a Offline (0)
  tool-bar
    a(@click='setSearch(true)'): i.material-icons search
  list-item(
    v-for='d in filteredDelegators'
    icon='computer'
    :key='d.id'
    :subtitle="todoAtoms"
    :title='d.id'
    :to="'/delegators/' + d.id")
</template>

<script>
import { mapGetters } from 'vuex'
import { includes, orderBy } from 'lodash'
import ListItem from '../common/NiListItem'
import ModalSearch from '../common/ModalSearchDelegators'
import Page from '../common/NiPage'
import TabBar from '../common/NiTabBar'
import ToolBar from '../common/NiToolBar'
export default {
  name: 'page-delegators',
  components: {
    ListItem,
    ModalSearch,
    Page,
    TabBar,
    ToolBar
  },
  computed: {
    ...mapGetters(['delegators', 'filters']),
    filteredDelegators () {
      let query = this.filters.delegators.search.query
      let list = orderBy(this.delegators, [this.sort.property], [this.sort.order])
      if (this.filters.delegators.search.visible) {
        return list.filter(i => includes(i.id, query))
      } else {
        return list
      }
    },
    online () { return this.filteredDelegators.length }
  },
  data: () => ({
    todoAtoms: '74.18 ATOM',
    sort: {
      property: 'id',
      order: 'asc',
      properties: [
        { id: 1, title: 'Type', value: 'type', hidden: true },
        { id: 2, title: 'ID', value: 'id', initial: true },
        { id: 3, title: 'Public Key', value: 'pub_key', disabled: true },
        { id: 4, title: 'Info', value: 'info' },
        { id: 5, title: 'Created', value: 'created_at' }
      ]
    }
  }),
  methods: {
    setSearch (v) { this.$store.commit('setDelegatorsSearchVisible', v) }
  },
  mounted () {
    Mousetrap.bind(['command+f', 'ctrl+f'], () => this.setSearch(true))
    Mousetrap.bind('esc', () => this.setSearch(false))
  } 
}
</script>
