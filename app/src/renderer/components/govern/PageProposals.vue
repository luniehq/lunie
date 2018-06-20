<template lang="pug">
tm-page(title='Proposals')
  div(slot="menu"): tool-bar
    router-link(to="/proposals/new" exact v-tooltip.bottom="'New Proposal'")
      i.material-icons add
    a(@click='setSearch()' v-tooltip.bottom="'Search'" :disabled="!somethingToSearch")
      i.material-icons search
  modal-search(type="proposals" v-if="somethingToSearch")

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
import { mapGetters } from "vuex"
import { includes, orderBy } from "lodash"
import Mousetrap from "mousetrap"
import DataLoading from "common/NiDataLoading"
import DataEmpty from "common/NiDataEmpty"
import DataEmptySearch from "common/NiDataEmptySearch"
import LiProposal from "govern/LiProposal"
import ModalSearch from "common/NiModalSearch"
import ToolBar from "common/VrToolBar"
import { TmPage } from "@tendermint-ui"
export default {
  name: "page-proposals",
  components: {
    DataLoading,
    DataEmpty,
    DataEmptySearch,
    LiProposal,
    ModalSearch,
    TmPage,
    ToolBar
  },
  computed: {
    ...mapGetters(["proposals", "filters"]),
    somethingToSearch() {
      return !this.proposals.loading && !!this.proposals.length
    },
    filteredProposals() {
      if (this.proposals.items && this.filters) {
        let query = this.filters.proposals.search.query
        let proposals = orderBy(
          this.proposals.items,
          [this.sort.property],
          [this.sort.order]
        )
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
      property: "created_at",
      order: "desc",
      properties: [
        {
          id: 1,
          title: "Title",
          value: "title"
        },
        {
          id: 2,
          title: "Type",
          value: "type"
        },
        {
          id: 3,
          title: "Created At",
          value: "created_at",
          initial: true
        },
        {
          id: 4,
          title: "Activated At",
          value: "active_at"
        },
        {
          id: 5,
          title: "Proposer",
          value: "entity_id"
        }
      ]
    }
  }),
  methods: {
    gotoPrevote() {
      this.$store.commit("notify", {
        title: "TODO: Prevote Proposals",
        body: "Work in progress."
      })
    },
    gotoArchive() {
      this.$store.commit("notify", {
        title: "TODO: Archive Proposals",
        body: "Work in progress."
      })
    },
    gotoNewProposal() {
      this.$router.push("/proposals/new")
    },
    setSearch(bool = !this.filters["proposals"].search.visible) {
      if (!this.somethingToSearch) return false
      this.$store.commit("setSearchVisible", ["proposals", bool])
    }
  },
  mounted() {
    Mousetrap.bind(["command+f", "ctrl+f"], () => this.setSearch(true))
    Mousetrap.bind(["command+n", "ctrl+n"], () => this.gotoNewProposal())
    Mousetrap.bind("esc", () => this.setSearch(false))
  }
}
</script>
