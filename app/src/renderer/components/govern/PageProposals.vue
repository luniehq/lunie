<template lang="pug">
page(title='Proposals')
  tab-bar
    router-link(to="/proposals" exact) Active
    router-link(to="/proposals/prevote" exact) Prevote
    router-link(to="/proposals/archive" exact) Archive
  tool-bar
    a(@click='toggleSearch'): i.material-icons search
    router-link(to="/proposals/new" exact): i.material-icons add
    a(@click='toggleFilter'): i.material-icons filter_list
  part
    li-proposal(v-for="p in filteredProposals" :key="p.id" :proposal="p")
</template>

<script>
import { mapGetters } from 'vuex'
import { orderBy } from 'lodash'
import LiProposal from './LiProposal'
import TabBar from '../common/NiTabBar'
import ToolBar from '../common/NiToolBar'
import Page from '../common/NiPage'
import Part from '../common/NiPart'
export default {
  name: 'page-proposals',
  components: {
    LiProposal,
    Page,
    Part,
    TabBar,
    ToolBar
  },
  computed: {
    ...mapGetters(['proposals']),
    filteredProposals () {
      if (this.proposals) {
        return orderBy(this.proposals, [this.sort.property], [this.sort.order])
      } else {
        return []
      }
    }
  },
  data () {
    return {
      sort: {
        property: 'created_at',
        order: 'desc',
        properties: [
          { id: 1, title: 'Title', value: 'title' },
          { id: 2, title: 'Type', value: 'type' },
          { id: 3, title: 'Created At', value: 'created_at', initial: true },
          { id: 4, title: 'Activated At', value: 'active_at' },
          { id: 5, title: 'Proposer', value: 'entity_id' }
        ]
      }
    }
  },
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
