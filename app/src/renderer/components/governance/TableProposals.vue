<template>
  <div>
    <table class="data-table">
      <thead>
        <panel-sort :sort="sort" :properties="properties" />
      </thead>
      <tbody>
        <li-proposal
          v-for="(value, key) in filteredProposals"
          :key="key"
          :proposal="value"
        />
      </tbody>
    </table>
  </div>
</template>

<script>
import { mapGetters } from "vuex"
import { orderBy } from "lodash"
import LiProposal from "./LiProposal"
import PanelSort from "staking/PanelSort"
export default {
  name: `table-proposals`,
  components: {
    LiProposal,
    PanelSort
  },
  props: {
    proposals: {
      type: Object,
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
    ...mapGetters([`session`]),
    filteredProposals() {
      const proposals = orderBy(
        this.proposals,
        [this.sort.property],
        [this.sort.order]
      )

      return proposals
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
          title: `Proposal Id`,
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
    this.$store.dispatch(`getProposals`)
  }
}
</script>
