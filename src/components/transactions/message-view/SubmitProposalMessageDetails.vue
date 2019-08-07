<template>
  <div>
    <div class="tx__content__caption">
      <p>
        Submitted {{ transaction.value.proposal_type.toLowerCase() }} proposal
        <b>{{ initialDeposit.amount | atoms | prettyLong }}</b>
        <span>{{ initialDeposit.denom | viewDenom }}</span>
      </p>
    </div>
    <div class="tx__content__information">
      Title
      <i>{{ transaction.value.title }}</i>
    </div>
  </div>
</template>

<script>
import { atoms, viewDenom, prettyLong } from "scripts/num.js"
import { formatBech32 } from "src/filters"

export default {
  name: `submit-proposal-message-details`,
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
    initialDeposit() {
      return this.transaction.value.initial_deposit[0]
    }
  }
}
</script>
