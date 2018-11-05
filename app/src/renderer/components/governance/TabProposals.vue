<template lang="pug">
  div
    tm-data-loading(v-if="proposals.loading")
    tm-data-empty(v-else-if="proposals.length === 0")
    data-empty-search(v-else-if="filteredProposals.length === 0")
    div(v-else)
      panel-sort(:sort='sort', :properties="properties")
      ol(type="1")
        li-proposal(
          v-for="(value, key) in filteredProposals"
             :key="key"
             :proposal="value")
</template>

<script>
import { mapGetters } from "vuex"
import { includes, orderBy } from "lodash"
import LiProposal from "./LiProposal"
import { TmDataEmpty, TmDataLoading } from "@tendermint/ui"
import DataEmptySearch from "common/TmDataEmptySearch"
import { ratToBigNumber } from "scripts/common"
import ModalSearch from "common/TmModalSearch"
import PanelSort from "staking/PanelSort"
import VmToolBar from "common/VmToolBar"
export default {
  name: `tab-proposals`,
  components: {
    LiProposal,
    TmDataEmpty,
    DataEmptySearch,
    TmDataLoading,
    ModalSearch,
    PanelSort,
    VmToolBar
  },
  data: () => ({
    query: ``,
    sort: {
      property: `proposal_id`,
      order: `desc`
    }
  }),
  computed: {
    ...mapGetters([`proposals`, `filters`, `config`]),
    // TODO delete once tally is changed from Rat --> Dec
    parsedProposals() {
      return !this.proposals || this.proposals.length === 0
        ? []
        : Object.values(this.proposals).map(p => {
            p.tally_result.yes = Math.round(
              ratToBigNumber(p.tally_result.yes).toNumber()
            )
            p.tally_result.no = Math.round(
              ratToBigNumber(p.tally_result.no).toNumber()
            )
            p.tally_result.no_with_veto = Math.round(
              ratToBigNumber(p.tally_result.no_with_veto).toNumber()
            )
            p.tally_result.abstain = Math.round(
              ratToBigNumber(p.tally_result.abstain).toNumber()
            )
            return p
          })
    },
    filteredProposals() {
      if (this.proposals && this.filters) {
        let query = this.filters.proposals.search.query
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
      } else {
        return []
      }
    },
    properties() {
      return [
        {
          title: `Proposal ID`,
          value: `proposal_id`,
          tooltip: `The ID of the proposal`,
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
  }
}
</script>
<style lang="stylus">
@require '~variables'

@media screen and (min-width: 768px)
  padding-bottom 4rem

.fixed-button-bar
  padding 1rem 1rem 1rem 2rem

@media screen and (min-width: 1024px)
  .fixed-button-bar
    margin-left width-side
</style>
