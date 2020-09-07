<template>
  <div class="proposals">
    <h4>Proposals</h4>
    <table class="data-table">
      <tbody></tbody>
    </table>
  </div>
</template>

<script>
import LiProposal from "governance/LiProposal"
export default {
  name: `table-proposals`,
  components: {
    LiProposal,
  },
  props: {
    proposals: {
      type: Array,
      required: true,
    },
  },
  data: () => ({
    sort: {
      property: `id`,
      order: `desc`,
    },
  }),
}
</script>
<style scoped>
h4 {
  font-size: 12px;
  padding-bottom: 1rem;
  color: var(--dim);
}
</style>
