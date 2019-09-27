<template>
  <div>
    <table class="data-table">
      <tbody>
        <LiProposal
          v-for="proposal in proposals"
          :key="proposal.id"
          :proposal="proposal"
        />
      </tbody>
    </table>
  </div>
</template>

<script>
import orderBy from "lodash.orderby"
import LiProposal from "governance/LiProposal"
export default {
  name: `table-proposals`,
  components: {
    LiProposal
  },
  props: {
    proposals: {
      type: Array,
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
