<template lang="pug">
tm-page(data-title='Governance').governance
  template(slot="menu-body")
    tm-balance(:tabs="tabs")

  div(slot="menu"): vm-tool-bar
    router-link(to="/governance/proposals/new" exact v-tooltip.bottom="'New Proposal'")
      i.material-icons add
    a(@click='setSearch()' v-tooltip.bottom="'Search'")
      i.search.material-icons search

  modal-search(type="proposals")

  router-view
</template>

<script>
import { mapGetters } from "vuex"
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
    setSearch(bool = !this.filters[`proposals`].search.visible) {
      this.$store.commit(`setSearchVisible`, [`proposals`, bool])
    }
  }
}
</script>
