<template>
  <div class="tx__content">
    <TransactionIcon :transaction-type="type" />
    <div class="tx__content__left">
      <h3>{{ caption }}</h3>
      <span>On&nbsp;</span>
      <router-link
        :to="{
          name: 'proposal',
          params: { proposalId: String(transaction.details.proposalId) },
        }"
        >Proposal &#35;{{ transaction.details.proposalId }}</router-link
      >
    </div>
    <div class="tx__content__right">
      <p class="amount">
        {{ transaction.details.amount.amount | prettyLong }}&nbsp;
        {{ transaction.details.amount.denom }}
      </p>
    </div>
  </div>
</template>

<script>
import { prettyLong } from "scripts/num.js"
import TransactionIcon from "../TransactionIcon"

export default {
  name: `deposit-tx-details`,
  filters: {
    prettyLong,
  },
  components: {
    TransactionIcon,
  },
  props: {
    transaction: {
      type: Object,
      required: true,
    },
    validators: {
      type: Object,
      required: true,
    },
  },
  data: () => {
    return {
      type: `Deposit`,
      caption: `Deposit`,
    }
  },
}
</script>
