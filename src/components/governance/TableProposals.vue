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
  })
}
</script>
