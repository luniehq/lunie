<template>
  <div>
    <div class="tx__content__caption">
      <p>
        Submitted {{ transaction.value.proposal_type.toLowerCase() }} proposal
        <b>{{ coin.amount | toAtoms | prettyLong }}</b>
        <span>{{ coin.denom | viewDenom }}</span>
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

