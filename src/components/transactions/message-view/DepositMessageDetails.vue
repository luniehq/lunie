<template>
  <div class="tx__content">
    <TransactionIcon
      :transaction-group="transaction.group"
      :transaction-type="caption"
    />
    <div class="tx__content__left">
      <h3>{{ caption }}</h3>
      <span>On&nbsp;</span>
      <router-link :to="`/governance/${transaction.value.proposal_id}`"
        >Proposal &#35;{{ transaction.value.proposal_id }}</router-link
      >
    </div>
    <div class="tx__content__right">
      <p class="amount">
        {{ deposit.amount | atoms | prettyLong }}&nbsp;
        {{ deposit.denom | viewDenom }}
      </p>
    </div>
  </div>
</template>

<script>
import { atoms, viewDenom, prettyLong } from "scripts/num.js"
import { formatBech32 } from "src/filters"
import TransactionIcon from "../TransactionIcon"

export default {
  name: `deposit-message-details`,
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
  data: () => {
    return {
      caption: `Deposit`
    }
  },
  computed: {
    deposit() {
      return this.transaction.value.amount[0]
    }
  }
}
</script>
