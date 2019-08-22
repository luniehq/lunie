<template>
  <div>
    <div class="tx__content__caption">
      <p>
        Submitted {{ type }}
        <b>{{ initialDeposit.amount | atoms | prettyLong }}</b>
        <span> {{ initialDeposit.denom | viewDenom }}</span>
      </p>
    </div>
    <div class="tx__content__information">
      Title&nbsp;
      <i>{{ transaction.value.content.value.title }}</i>
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
    },
    type() {
      switch (this.transaction.value.content.type) {
        case "cosmos-sdk/TextProposal":
          return "text proposal"
      }
      return "proposal"
    }
  }
}
</script>
