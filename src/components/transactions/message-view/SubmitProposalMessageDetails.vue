<template>
  <div class="tx__content">
    <TransactionIcon :transaction-type="type" />
    <div class="tx__content__left">
      <h3>{{ caption }}</h3>
      <span>{{ transaction.details.proposalTitle }}</span>
    </div>
    <div class="tx__content__right">
      <p class="amount">
        {{ transaction.details.initialDeposit.amount | prettyLong }}&nbsp;
        {{ transaction.details.initialDeposit.denom }}
      </p>
    </div>
  </div>
</template>

<script>
import { atoms, viewDenom, prettyLong } from "scripts/num.js"
// import { formatBech32 } from "src/filters"
import TransactionIcon from "../TransactionIcon"

export default {
  name: `submit-proposal-message-details`,
  filters: {
    atoms,
    viewDenom,
    prettyLong,
    // formatBech32
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
  data: () => {
    return {
      type: `Submitted`,
      caption: `Submitted proposal`
    }
  }
}
</script>
