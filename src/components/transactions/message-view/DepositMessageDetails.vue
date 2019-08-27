<template>
  <div>
    <div class="tx__content__caption">
      <p>
        Deposited
        <b>{{ deposit.amount | atoms | prettyLong }}</b>
        <span> {{ deposit.denom | viewDenom }}</span>
      </p>
    </div>
    <div class="tx__content__information">
      On&nbsp;
      <router-link :to="`/governance/${transaction.value.proposal_id}`"
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
    validators: {
      type: Object,
      required: true
    }
  },
  computed: {
    deposit() {
      return this.transaction.value.amount[0]
    }
  }
}
</script>
