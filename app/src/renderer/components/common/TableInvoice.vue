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
      required: true
    }
  },
  data: () => ({
    full
  }),
  computed: {
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
