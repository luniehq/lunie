<template>
  <div>
    <ul class="table-invoice">
      <li v-if="subTotal > 0">
        <span>Subtotal</span>
        <span>
          {{ num.fullDecimals(subTotal) }} {{ num.viewDenom(bondDenom) }}
        </span>
      </li>
      <li>
        <span>Network Fee</span>
        <span>
          {{ num.fullDecimals(estimatedFee) }}
          {{ num.viewDenom(bondDenom) }}
        </span>
      </li>
      <li class="total-row">
        <span>Total</span>
        <span>
          {{ num.fullDecimals(total) }} {{ num.viewDenom(bondDenom) }}
        </span>
      </li>
    </ul>
  </div>
</template>
<script>
import num from "../../scripts/num.js"
import { mapGetters } from "vuex"

export default {
  name: `table-invoice`,
  props: {
    amount: {
      type: Number,
      required: true
    },
    gasEstimate: {
      type: Number,
      required: true
    },
    gasPrice: {
      type: Number,
      default: 2.5e-8 // 0.025 uatoms
    }
  },
  data: () => ({
    num,
    info: `Estimated network fees based on simulation.`
  }),
  computed: {
    ...mapGetters([`bondDenom`]),
    estimatedFee() {
      return Number(this.gasPrice) * Number(this.gasEstimate) // already in atoms
    },
    subTotal() {
      return Number(this.amount) // already in atoms
    },
    total() {
      return this.estimatedFee + this.subTotal // already in atoms
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
