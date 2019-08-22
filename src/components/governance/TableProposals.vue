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
import orderBy from "lodash.orderby"
import LiProposal from "./LiProposal"
export default {
  name: `table-proposals`,
  components: {
    LiProposal
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
      Object.keys(copy).forEach(id => {
        copy[id].id = Number(id)
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
