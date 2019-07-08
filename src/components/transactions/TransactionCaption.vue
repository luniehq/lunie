<template>
  <div>Caption: {{ JSON.stringify(transaction) }}</div>
</template>

<script>
import { atoms as toAtoms, viewDenom } from "../../scripts/num.js"

export default {
  name: `transaction-caption`,
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
