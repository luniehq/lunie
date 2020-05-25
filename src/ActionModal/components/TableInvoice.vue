<template>
  <div>
    <ul class="table-invoice">
      <li v-if="subTotal > 0" class="sub-total">
        <span>Subtotal</span>
        <span> {{ subTotal | fullDecimals }} {{ bondDenom }} </span>
      </li>
      <li class="fees">
        <span>Network Fee</span>
        <span>
          {{ estimatedFee | fullDecimals }}
          {{ feeDenom || bondDenom }}
        </span>
      </li>
      <li class="total-row">
        <span>Total</span>
        <div class="total-column">
          <p>{{ total | fullDecimals }} {{ bondDenom }}</p>
          <p v-if="feeDenom && feeDenom !== bondDenom">
            {{ estimatedFee | fullDecimals }} {{ feeDenom }}
          </p>
        </div>
      </li>
    </ul>
  </div>
</template>
<script>
import { fullDecimals } from "../../scripts/num"

export default {
  name: `table-invoice`,
  filters: {
    fullDecimals,
  },
  props: {
    amount: {
      type: Number,
      required: true,
    },
    estimatedFee: {
      type: Number,
      required: true,
    },
    bondDenom: {
      type: String,
      required: true,
    },
    feeDenom: {
      type: String,
      default: "",
    },
  },
  data: () => ({
    info: `Estimated network fees based on simulation.`,
  }),
  computed: {
    subTotal() {
      return this.amount
    },
    total() {
      // if there is a feeDenom, it means that subTotal and estimatedFee are different currencies and
      // cannot be therefore added up together
      return this.feeDenom && this.feeDenom !== this.bondDenom
        ? this.subTotal
        : this.estimatedFee + this.subTotal
    },
  },
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

.total-column {
  display: flex;
  flex-direction: column;
}
</style>
