<template lang="pug">
page(title='Peer Nodes')
  tab-bar
    router-link(to="/validators" exact) Online ({{ online }})
    router-link(to="/validators/offline" exact) Offline (0)
    a(@click.prevent='toggleFilter' href="#"): i.material-icons(:class="{'mdi-rotate-180': asc}") filter_list
  // tool-bar
    a(@click='toggleSearch'): i.material-icons search
    a(@click='toggleSearch'): i.material-icons search
  list-item(
    v-for="v in values"
    :key="v.node_info.listen_addr"
    :title="getTitle(v)"
    :subtitle="getIp(v)"
    icon='storage'
    :to="`/validators/${urlsafeIp(getIp(v))}`")
</template>

<script>
import { mapGetters } from 'vuex'
import { orderBy } from 'lodash'
import ListItem from './NiListItem'
import Page from './NiPage'
import TabBar from './NiTabBar'
import ToolBar from './NiToolBar'
export default {
  name: 'page-validators',
  components: {
    ListItem,
    Page,
    TabBar,
    ToolBar
  },
  data () {
    return {
      asc: false
    }
  },
  computed: {
    ...mapGetters(['peers']),
    values () {
      // return orderBy(this.peers, 'node_info.moniker', this.asc ? 'asc' : 'desc')
      return orderBy(this.peers, (e) => {
        return (e.validator && e.validator.voting_power) || 0
      }, this.asc ? 'asc' : 'desc')
    },
    online () { return this.peers.length }
  },
  methods: {
    toggleFilter () {
      this.asc = !this.asc
      // this.$store.commit('notify', { title: 'Filtering...', body: 'TODO' })
    },
    toggleSearch () {
      // this.$store.commit('notify', { title: 'Searching...', body: 'TODO' })
    },
    urlsafeIp (ip) {
      return ip.split('.').join('-')
    },
    getIp (validator) {
      return validator.node_info.listen_addr.split(':')[0]
    },
    getTitle (v) {
      return v.node_info.moniker + (v.validator ? ' — ' + v.validator.voting_power : ' — 0')
    }
  }
}
</script>
