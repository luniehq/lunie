<template>
  <div>
    <table class="data-table">
      <!-- <tr
      v-for="(item, index) in amounts"
      :key="index"
      >
        <td v-if="index === 0 && amounts.length === 1">
          Subtotals
        </td>
        <td v-else-if="index === 0  && amounts.length > 1">
          Subtotal
        </td>
        <td v-else colspan="1" />
        <td colspan="2"/>
        <td>
          {{ `${item.amount}` `${item.denom}s` }}
        </td>
      </tr> -->
      <tr>
        <td>
          Fees (estimated)
        </td>
        <td colspan="2" />
        <td>
          {{ `${estimatedFee}` `${denom}s` }}
        </td>
      </tr><tr>
        <br>
      </tr><tr>
        <td>
          Total
        </td>
        <td colspan="2" />
        <td>
          {{ `${total}` `${denom}s` }}
        </td>
      </tr>
    </table>
  </div>
</template>

<script>
export default {
  name: `table-invoice`,
  props: {
    amounts: {
      type: Array,
      default: null
    },
    gasEstimate: {
      type: Number,
      required: true
    },
    gasPrice: {
      type: Number,
      required: true
    },
    denom: {
      type: String,
      required: true
    }
  },
  computed: {
    estimatedFee() {
      return this.gasPrice * this.gasEstimate
    },
    total() {
      if (this.amount) {
        return this.amount + this.estimatedFee
      }
      return this.estimatedFee
    }
  }
}
</script>
