<template>
  <div>
    <table class="data-table">
      <tr>
        <td>
          Subtotal
        </td>
        <td>
          {{ full(subTotal) }}
        </td>
      </tr>
      <tr>
        <td>
          Fees (estimated)
        </td>
        <td>
          {{ full(estimatedFee) }}
        </td>
      </tr>
      <tr>
        <td>
          Total
        </td>
        <td>
          {{ full(total) }}
        </td>
      </tr>
    </table>
  </div>
</template>
<script>
import { full } from "../../scripts/num.js"
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
    full,
    info: `Estimated network fees based on simulation.`
  }),
  computed: {
    ...mapGetters([`session`]),
    estimatedFee() {
      return (
        Number(this.gasPrice) *
        Number(this.gasEstimate) *
        this.session.gasAdjustment
      ) // already in atoms
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
.data-table {
  margin: 2rem 0 0;
  border-collapse: inherit;
  padding: 0 0.25rem;
  font-size: var(--sm);
}

.data-table tr {
  width: 100%;
}

.data-table td {
  padding: 0;
  color: var(--dim);
}

.data-table td:not(:first-child) {
  text-align: right;
}
</style>
