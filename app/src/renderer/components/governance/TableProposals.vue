<template lang="pug">
div
  tm-data-loading(v-if="loading")
  tm-data-empty(v-else-if="proposals.length === 0")
  data-empty-search(v-else-if="filteredProposals.length === 0")
  table(v-else)
    thead
      panel-sort(:sort='sort', :properties="properties")
    tbody
      li-proposal(
        v-for="(value, key) in filteredProposals"
           :key="key"
           :proposal="value")
</template>

<script>
import { mapGetters } from "vuex"
import Mousetrap from "mousetrap"
import { includes, orderBy } from "lodash"
import LiProposal from "./LiProposal"
import { TmDataEmpty, TmDataLoading } from "@tendermint/ui"
import DataEmptySearch from "common/TmDataEmptySearch"
import ModalSearch from "common/TmModalSearch"
import PanelSort from "staking/PanelSort"
import VmToolBar from "common/VmToolBar"
export default {
  name: `table-proposals`,
  components: {
    LiProposal,
    TmDataEmpty,
    DataEmptySearch,
    TmDataLoading,
    ModalSearch,
    PanelSort,
    VmToolBar
  },
  props: {
    proposals: {
      type: Array,
      required: true
    },
    loading: {
      type: Boolean,
      required: true
    }
  },
  data: () => ({
    query: ``,
    sort: {
      property: `proposal_id`,
      order: `desc`
    }
  }),
  computed: {
    ...mapGetters([`filters`, `config`]),
    somethingToSearch() {
      return !!this.proposals.length
    },
    parsedProposals() {
      if (!this.proposals || this.proposals.length === 0) return []

      let copiedProposals = JSON.parse(JSON.stringify(this.proposals))
      return Object.values(copiedProposals).map(p => {
        p.tally_result.yes = Math.round(parseFloat(p.tally_result.yes))
        p.tally_result.no = Math.round(parseFloat(p.tally_result.no))
        p.tally_result.no_with_veto = Math.round(
          parseFloat(p.tally_result.no_with_veto)
        )
        p.tally_result.abstain = Math.round(parseFloat(p.tally_result.abstain))
        return p
      })
    },
    filteredProposals() {
      if (!this.proposals || this.proposals.length === 0) return []

      let query = this.filters.proposals.search.query || ``
      let proposals = orderBy(
        this.parsedProposals,
        [this.sort.property],
        [this.sort.order]
      )
      if (this.filters.proposals.search.visible) {
        return proposals.filter(p =>
          includes(p.title.toLowerCase(), query.toLowerCase())
        )
      } else {
        return proposals
      }
    },
    properties() {
      return [
        {
          title: `Title`,
          value: `title`,
          tooltip: `The title of the proposal`,
          class: `proposal_title`
        },
        {
          title: `Proposal id`,
          value: `proposal_id`,
          tooltip: `Id of the proposal`,
          class: `proposal_id`
        },
        {
          title: `Yes`,
          value: `tally_result.yes`,
          tooltip: `Yes votes`,
          class: `yes_votes`
        },
        {
          title: `No`,
          value: `tally_result.no`,
          tooltip: `No votes`,
          class: `no_votes`
        },
        {
          title: `No with Veto`,
          value: `tally_result.no_with_veto`,
          tooltip: `No with veto votes`,
          class: `no_veto_votes`
        },
        {
          title: `Abstain`,
          value: `tally_result.abstain`,
          tooltip: `Abstain votes`,
          class: `abstain_votes`
        }
      ]
    }
  },
  mounted() {
    Mousetrap.bind([`command+f`, `ctrl+f`], () => this.setSearch(true))
    Mousetrap.bind([`command+n`, `ctrl+n`], () => this.newProposal())
    Mousetrap.bind(`esc`, () => this.setSearch(false))
    this.$store.dispatch(`getProposals`)
  },
  methods: {
    setSearch(
      bool = !this.filters[`proposals`].search.visible,
      { somethingToSearch, $store } = this
    ) {
      if (somethingToSearch) {
        $store.commit(`setSearchVisible`, [`proposals`, bool])
      }
    }
  }
}
</script>
<style lang="stylus">
@require '~variables'

table
  border-spacing 0 0.25rem
  margin 0 0 0 2rem
  min-width
  padding 0
  table-layout auto
  counter-reset rowNumber + 1

table tr
  counter-increment rowNumber

table tr td:first-child::before
  content counter(rowNumber)
  position absolute
  font-size sm
  width 2rem
  text-align right
  color var(--dim)
  left -3rem

table th
  min-width 130px
  width 100%
  padding 0.5rem

table td
  min-width 130px
  width 100%
  padding 0 0.5rem
  position relative

  a
    display inline-block

table tr td:nth-child(3):after
  display block
  position absolute
  content ''
  height 2rem
  width 2px
  top 1.5rem
  right 2rem
  background var(--bc-dim)
</style>
