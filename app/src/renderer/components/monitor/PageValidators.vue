<template lang="pug">
page(title='Validators')
  tab-bar
    router-link(to="/validators" exact) Online ({{ online }})
    router-link(to="/validators/offline" exact) Offline (0)
  tool-bar
    a(@click='toggleSearch'): i.material-icons search
    a(@click='toggleFilter'): i.material-icons filter_list
  list-item(
    v-for="v in values"
    :key="v.node_info.moniker"
    :title="v.node_info.moniker"
    :subtitle="todoAtoms"
    icon='storage'
    :to="`/validators/${urlsafeIp(v.node_info.moniker)}`")
</template>

<script>
import { mapGetters } from 'vuex'
import { orderBy } from 'lodash'
import ListItem from '../common/NiListItem'
import Page from '../common/NiPage'
import TabBar from '../common/NiTabBar'
import ToolBar from '../common/NiToolBar'
export default {
  name: 'page-validators',
  components: {
    ListItem,
    Page,
    TabBar,
    ToolBar
  },
  data: () => ({
    todoAtoms: '13.37M ATOM'
  }),
  computed: {
    ...mapGetters(['validators']),
    values () {
      return orderBy(this.validators, ['node_info.moniker', 'desc'])
    },
    online () { return this.validators.length }
  },
  methods: {
    toggleFilter () {
      this.$store.commit('notify', { title: 'Filtering...', body: 'TODO' })
    },
    toggleSearch () {
      this.$store.commit('notify', { title: 'Searching...', body: 'TODO' })
    },
    urlsafeIp (ip) {
      return ip.split('.').join('-')
    }
  }
}
</script>
