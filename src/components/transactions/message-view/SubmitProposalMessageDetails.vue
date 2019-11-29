<template>
  <div class="tx__content">
    <TransactionIcon
      :transaction-group="transaction.group"
      :transaction-type="caption"
    />
    <div class="tx__content__left">
      <h3>{{ caption }}</h3>
      <span>{{ transaction.value.title }}</span>
    </div>
    <div class="tx__content__right">
      <p class="amount">
        {{ initialDeposit.amount | atoms | prettyLong }}&nbsp;
        {{ initialDeposit.denom | viewDenom }}
      </p>
    </div>
  </div>
</template>

<script>
import { atoms, viewDenom, prettyLong } from "scripts/num.js"
import { formatBech32 } from "src/filters"
import TransactionIcon from "../TransactionIcon"

export default {
  name: `submit-proposal-message-details`,
  filters: {
    atoms,
    viewDenom,
    prettyLong,
    formatBech32
  },
  components: {
    TransactionIcon
  },
  props: {
    transaction: {
      type: Object,
      required: true
    },
    validators: {
      type: Object,
      required: true
    }
  },
  computed: {
    initialDeposit() {
      return this.transaction.value.initial_deposit[0]
    },
    caption() {
      return `Submitted proposal`
    }
  }
}
</script>
