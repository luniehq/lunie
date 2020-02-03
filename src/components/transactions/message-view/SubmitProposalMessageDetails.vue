<template>
  <div class="tx__content">
    <TransactionIcon
      :transaction-group="transaction.group"
      :transaction-type="type"
    />
    <div class="tx__content__left">
      <h3>{{ caption }}</h3>
      <span>{{ transaction.value.title }}</span>
    </div>
    <div class="tx__content__right">
      <p class="amount">
        {{ initialDeposit.amount | prettyLong }}&nbsp;
        {{ initialDeposit.denom }}
      </p>
    </div>
  </div>
</template>

<script>
import { prettyLong } from "scripts/num.js"
import { formatBech32 } from "src/filters"
import TransactionIcon from "../TransactionIcon"

export default {
  name: `submit-proposal-message-details`,
  filters: {
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
  data: () => {
    return {
      type: `Submitted`,
      caption: `Submitted proposal`
    }
  },
  computed: {
    initialDeposit() {
      return this.transaction.value.initial_deposit[0]
    }
  }
}
</script>
