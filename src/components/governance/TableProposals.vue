<template>
  <div>
    <table class="data-table">
      <tbody>
        <LiProposal
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
import orderBy from "lodash.orderby"
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
    sort: {
      property: `id`,
      order: `desc`
    }
  }),
  computed: {
    enrichedProposals() {
      const copy = JSON.parse(JSON.stringify(this.proposals))
      Object.keys(copy).forEach(proposal_id => {
        copy[proposal_id].id = Number(proposal_id)
      })
      return copy
    },
    filteredProposals() {
      const proposals = orderBy(
        this.enrichedProposals,
        [this.sort.property],
        [this.sort.order]
      )

      return proposals
    }
  },
  mounted() {
    this.$store.dispatch(`getProposals`)
  }
}
</script>
