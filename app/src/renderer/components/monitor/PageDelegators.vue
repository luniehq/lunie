<template lang='pug'>
page(title='Delegators')
  tab-bar
    router-link(to="/delegators" exact) Online ({{ online }})
    a Offline (0)
  tool-bar
    a(@click='toggleSearch'): i.material-icons search
    a(@click='toggleFilter'): i.material-icons filter_list
  list-item(
    :to="'/delegators/' + delegator.id"
    v-for='delegator in filteredDelegators'
    :key='delegator.id'
    icon='computer'
    :title='delegator.id'
    :subtitle="todoAtoms")
</template>

<script>
import { mapGetters } from 'vuex'
import { orderBy } from 'lodash'
import ListItem from '../common/NiListItem'
import Page from '../common/NiPage'
import Part from '../common/NiPart'
import TabBar from '../common/NiTabBar'
import ToolBar from '../common/NiToolBar'
export default {
  name: 'page-delegators',
  components: {
    ListItem,
    Page,
    Part,
    TabBar,
    ToolBar
  },
  computed: {
    ...mapGetters(['delegators']),
    filteredDelegators () {
      return orderBy(this.delegators, [this.sort.property], [this.sort.order])
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
    toggleFilter () {
      this.$store.commit('notify', { title: 'Filtering...', body: 'TODO' })
    },
    toggleSearch () {
      this.$store.commit('notify', { title: 'Searching...', body: 'TODO' })
    }
  }
}
</script>
