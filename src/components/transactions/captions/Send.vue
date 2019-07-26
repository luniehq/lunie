<template>
  <div>
    Sent
    <b>{{ coin.amount | toAtoms | prettyLong }}</b>
    <span>{{ coin.denom | viewDenom }}</span>
  </div>
</template>

<script>
import { atoms, viewDenom } from "../../scripts/num.js"

export default {
  name: `send-caption-component`,
  filters: {
    atoms,
    viewDenom
  },
  props: {
    transaction: {
      type: Object,
      required: true
    },
    coin: {
      type: Object,
      require: false,
      default: function() {}
    }
  }
}
</script>

<style>
</style>
