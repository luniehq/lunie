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
import { mapGetters, mapActions } from "vuex"
import num from "scripts/num"
import { includes, orderBy } from "lodash"
import Mousetrap from "mousetrap"
import LiProposal from "./LiProposal"
import { TmDataEmpty, TmDataLoading } from "@tendermint/ui"
import DataEmptySearch from "common/TmDataEmptySearch"
import { calculateTokens } from "scripts/common"
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
    num: num,
    query: ``,
    sort: {
      property: `percent_of_vote`,
      order: `desc`
    }
  }),
  computed: {
    ...mapGetters([`proposals`, `filters`, `config`]),
    filteredProposals() {
      if (this.proposals && this.filters) {
        let query = this.filters.proposals.search.query
        let proposals = orderBy(
          this.proposals,
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
    },
    properties() {
      return [
        {
          title: `Yes`,
          value: `yes_votes`,
          tooltip: `Yes votes`,
          class: `name`
        },
        {
          title: `No`,
          value: `no_votes`,
          tooltip: `No votes`,
          class: `your-votes`
        },
        {
          title: `No with Veto`,
          value: `no_with_veto_votes`, // TODO: use real rewards
          tooltip: `No with veto votes`,
          class: `your-rewards` // TODO: use real rewards
        },
        {
          title: `Abstain`,
          value: `abstain_votes`,
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
