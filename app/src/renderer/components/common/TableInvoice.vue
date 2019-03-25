<template>
  <div>
    <table class="data-table">
      <tr>
        <td>
          Subtotal
        </td>
        <td>
          <b>ø</b>{{ full(subTotal) }}
        </td>
      </tr>
      <tr>
        <td>
          Fees (estimated)
          <i
            v-tooltip.left="info"
            class="material-icons info-button"
          >
            info_outline
          </i>
        </td>
        <td>
          <b>ø</b>{{ full(estimatedFee) }}
        </td>
      </tr>
      <tr>
        <td>
          Total
        </td>
        <td>
          <b>ø</b>{{ full(total) }}
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
    info: `Estimated fees required to process the transaction, based on simulation. Lunie doesn't take any fees.`
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
  border-spacing: 0 0.25rem;
  width: 17rem;
  padding: 0;
  table-layout: auto;
  float: right;
}

.data-table td:not(:first-child) {
  text-align: right;
}
</style>
