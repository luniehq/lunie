<template>
  <div>
    <ul class="table-invoice">
      <li v-if="subTotal > 0">
        <span>Subtotal</span>
        <span> {{ subTotal | fullDecimals }} {{ bondDenom | viewDenom }} </span>
      </li>
      <li>
        <span>Network Fee</span>
        <span>
          {{ estimatedFee | fullDecimals }}
          {{ bondDenom | viewDenom }}
        </span>
      </li>
      <li class="total-row">
        <span>Total</span>
        <span> {{ total | fullDecimals }} {{ bondDenom | viewDenom }} </span>
      </li>
    </ul>
  </div>
</template>
<script>
import { fullDecimals, viewDenom } from "../../scripts/num"

export default {
  name: `table-invoice`,
  filters: {
    fullDecimals,
    viewDenom
  },
  props: {
    amount: {
      type: Number,
      required: true
    },
    estimatedFee: {
      type: Number,
      required: true
    },
    bondDenom: {
      type: String,
      required: true
    }
  },
  data: () => ({
    info: `Estimated network fees based on simulation.`
  }),
  computed: {
    subTotal() {
      return this.amount
    },
    total() {
      return this.estimatedFee + this.subTotal
    }
  }
}
</script>
<style scoped>
.table-invoice {
  margin: 2rem 0 0;
  border-collapse: inherit;
  padding: 0 0.25rem;
  font-size: var(--sm);
  letter-spacing: 0.4px;
}

.table-invoice li {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-invoice span {
  padding: 0;
  color: var(--dim);
}

.table-invoice span:not(:first-child) {
  text-align: right;
}

.total-row {
  border-top: 2px solid var(--bc);
  margin-top: 0.5rem;
  padding-top: 0.25rem;
}
</style>
