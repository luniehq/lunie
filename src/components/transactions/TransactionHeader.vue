<template>
  <div>Header {{ JSON.stringify(transaction) }}</div>
</template>

<script>
import { atoms as toAtoms, viewDenom } from "../../scripts/num.js"

export default {
  name: `transaction-header`,
  filters: {
    toAtoms,
    viewDenom
  },
  props: {
    transaction: {
      type: Object,
      required: true
    }
  }
}
</script>

<style></style>
