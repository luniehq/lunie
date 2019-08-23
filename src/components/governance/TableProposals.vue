<template>
  <div>
    <table class="data-table">
      <tbody>
        <LiProposal
          v-for="(value, key) in proposals"
          :key="key"
          :proposal="value"
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
  }
}
</script>
