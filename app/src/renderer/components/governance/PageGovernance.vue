<template lang="pug">
tm-page(data-title='Proposals')
  template(slot="menu-body", v-if="config.devMode")
    tm-balance(:tabs="tabs")

  div(slot="menu"): vm-tool-bar
    router-link(to="/proposals/new" exact v-tooltip.bottom="'New Proposal'")
      i.material-icons add
    a(@click='setSearch()' v-tooltip.bottom="'Search'" :disabled="!somethingToSearch")
      i.material-icons search

  modal-search(type="proposals" v-if="somethingToSearch")

  router-view
</template>

<script>
import { mapGetters } from "vuex"
import Mousetrap from "mousetrap"
import DataEmptySearch from "common/TmDataEmptySearch"
import ModalSearch from "common/TmModalSearch"
import VmToolBar from "common/VmToolBar"
import TmBalance from "common/TmBalance"
import { TmPage, TmDataEmpty, TmDataLoading } from "@tendermint/ui"
export default {
  name: `page-governance`,
  components: {
    TmBalance,
    TmDataLoading,
    TmDataEmpty,
    DataEmptySearch,
    ModalSearch,
    TmPage,
    VmToolBar
  },
  computed: {
    ...mapGetters([`config`, `proposals`, `filters`])
  },
  data: () => ({
    tabs: [`Proposals`]
  }),
  methods: {
    somethingToSearch() {
      return !this.proposals && Object.keys(this.proposals).length > 0
    },
    getProposals() {
      this.$store.dispatch(`getProposals`)
    },
    newProposal() {
      this.$router.push(`/proposals/new`)
    },
    setSearch(bool = !this.filters[`proposals`].search.visible) {
      if (!this.somethingToSearch) return false
      this.$store.commit(`setSearchVisible`, [`proposals`, bool])
    }
  },
  mounted() {
    this.getProposals()
    Mousetrap.bind([`command+f`, `ctrl+f`], () => this.setSearch(true))
    Mousetrap.bind([`command+n`, `ctrl+n`], () => this.newProposal())
    Mousetrap.bind(`esc`, () => this.setSearch(false))
  }
}
</script>
