<template lang="pug">
page(title='Proposals')
  modal-search(v-if="filters.proposals.search.visible")
  tab-bar
    router-link(to="/" exact) Active
    a(@click="gotoPrevote()") Prevote
    a(@click="gotoArchive()") Archive
  tool-bar
    a(@click='toggleSearch'): i.material-icons search
    router-link(to="/proposals/new" exact): i.material-icons add
    a(@click='toggleFilter'): i.material-icons filter_list
  part
    li-proposal(v-for="p in filteredProposals" :key="p.id" :proposal="p")
</template>

<script>
import { mapGetters } from 'vuex'
import { includes, orderBy } from 'lodash'
import LiProposal from './LiProposal'
import ModalSearch from '../common/NiModalSearch'
import TabBar from '../common/NiTabBar'
import ToolBar from '../common/NiToolBar'
import Page from '../common/NiPage'
import Part from '../common/NiPart'
export default {
  name: 'page-proposals',
  components: {
    LiProposal,
    ModalSearch,
    Page,
    Part,
    TabBar,
    ToolBar
  },
  computed: {
    ...mapGetters(['proposals', 'filters']),
    filteredProposals () {
      if (this.proposals && this.filters) {
        let query = this.filters.proposals.search.query
        let proposals = orderBy(this.proposals, [this.sort.property], [this.sort.order])
        return proposals.filter(p => includes(p.title.toLowerCase(), query))
      } else {
        return []
      }
    }
  },
  data: () => ({
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
  }),
  methods: {
    gotoPrevote () {
      this.$store.commit('notify', { title: 'TODO: Prevote Proposals', body: 'Work in progress.' })
    },
    gotoArchive () {
      this.$store.commit('notify', { title: 'TODO: Archive Proposals', body: 'Work in progress.' })
    },
    toggleFilter () {
      this.$store.commit('notify', { title: 'Filtering...', body: 'TODO' })
    },
    toggleSearch () { this.$store.commit('setProposalsSearchVisible', true) }
  }
}
</script>
