<template lang="pug">
page(title='Proposals')
  div(slot="menu"): tool-bar
    router-link(to="/proposals/new" exact)
      i.material-icons add
      .label New Proposal
    a(@click='setSearch(true)')
      i.material-icons search
      .label Search
  modal-search(type="proposals")

  data-loading(v-if="proposals.loading")
  data-empty(v-else-if="proposals.length === 0")
  data-empty-search(v-else-if="filteredProposals.length === 0")
  li-proposal(
    v-else
    v-for="p in filteredProposals"
    :key="p.id"
    :proposal="p")
</template>

<script>
import { mapGetters } from 'vuex'
import { includes, orderBy } from 'lodash'
import Mousetrap from 'mousetrap'
import DataLoading from 'common/NiDataLoading'
import DataEmpty from 'common/NiDataEmpty'
import DataEmptySearch from 'common/NiDataEmptySearch'
import LiProposal from 'govern/LiProposal'
import ModalSearch from 'common/NiModalSearch'
import TabBar from 'common/NiTabBar'
import ToolBar from 'common/NiToolBar'
import Page from 'common/NiPage'
import Part from 'common/NiPart'
export default {
  name: 'page-proposals',
  components: {
    DataLoading,
    DataEmpty,
    DataEmptySearch,
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
      if (this.proposals.items && this.filters) {
        let query = this.filters.proposals.search.query
        let proposals = orderBy(this.proposals.items, [this.sort.property], [this.sort.order])
        if (this.filters.proposals.search.visible) {
          return proposals.filter(p => includes(p.title.toLowerCase(), query))
        } else {
          return proposals
        }
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
    gotoNewProposal () { this.$router.push('/proposals/new') },
    setSearch (bool) { this.$store.commit('setSearchVisible', ['proposals', bool]) }
  },
  mounted () {
    Mousetrap.bind(['command+f', 'ctrl+f'], () => this.setSearch(true))
    Mousetrap.bind(['command+n', 'ctrl+n'], () => this.gotoNewProposal())
    Mousetrap.bind('esc', () => this.setSearch(false))
  }
}
</script>
