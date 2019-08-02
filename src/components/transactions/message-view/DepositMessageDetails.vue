<template>
  <div>
    <div class="tx__content__caption">
      <p class="tx__content__caption__title">
        Deposited
        <b>{{ coin.amount | toAtoms | prettyLong }}</b>
        <span>{{ coin.denom | viewDenom }}</span>
      </p>
    </div>
    <div class="tx__content__information">
      On
      <router-link :to="`/governance/${ransaction.value.proposal_id}`"
        >Proposal &#35;{{ transaction.value.proposal_id }}</router-link
      >
    </div>
  </div>
</template>

<script>
import { atoms, viewDenom, prettyLong } from "scripts/num.js"
import { formatBech32 } from "src/filters"

export default {
  name: `deposit-message-details`,
  filters: {
    atoms,
    viewDenom,
    prettyLong,
    formatBech32
  },
  props: {
    transaction: {
      type: Object,
      required: true
    },
    coin: {
      type: Object,
      required: true
    },
    validators: {
      type: Object,
      required: true
    }
  }
}
</script>
