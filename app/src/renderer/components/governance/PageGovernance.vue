<template lang="pug">
tm-page(data-title='Governance').governance
  template(slot="menu-body")
    tm-balance(:tabs="tabs")
    tm-btn#propose-btn(value="Create Proposal" color="primary" @click.native="onPropose")

  div(slot="menu"): vm-tool-bar
    router-link(to="/governance/proposals/new" exact v-tooltip.bottom="'New Proposal'")
      i.material-icons add
    a(@click='setSearch()' v-tooltip.bottom="'Search'")
      i.search.material-icons search

  modal-search(type="proposals")
  modal-propose(
    v-if="showModalPropose"
    v-on:createProposal="propose"
    :showModalVote.sync="showModalVote"
    :denom="bondingDenom.toLowerCase()"
  )
  router-view
</template>

<script>
import { mapGetters } from "vuex"
import DataEmptySearch from "common/TmDataEmptySearch"
import ModalSearch from "common/TmModalSearch"
import ModalPropose from "./ModalPropose"
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
    ModalPropose,
    TmPage,
    VmToolBar
  },
  computed: {
    // TODO: get min deposit denom from gov params
    ...mapGetters([`proposals`, `filters`, `bondingDenom`])
  },
  data: () => ({
    tabs: [`Proposals`],
    showModalPropose: false
  }),
  methods: {
    onPropose() {
      this.showModalPropose = true
    },
    async propose({ title, description, type, amount }) {
      try {
        this.$store.dispatch(`submitProposal`, {
          title,
          description,
          type,
          initial_deposit: [
            {
              denom: this.bondingDenom.toLowerCase(),
              amount
            }
          ]
        })
        this.$store.commit(`notify`, {
          title: `Successful proposal submission!`,
          body: `You have successfully submitted a new ${this.proposal_type.toLowercase()} proposal`
        })
      } catch ({ message }) {
        this.$store.commit(`notifyError`, {
          title: `Error while submitting a new ${this.proposal_type.toLowercase()} proposal`,
          body: message
        })
      }
    },
    setSearch(bool = !this.filters[`proposals`].search.visible) {
      this.$store.commit(`setSearchVisible`, [`proposals`, bool])
    }
  }
}
</script>
