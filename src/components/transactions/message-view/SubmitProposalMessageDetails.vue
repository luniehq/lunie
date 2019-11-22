<template>
  <div>
    <div v-if="show === `caption`" class="tx__content__caption">
      <div class="tx__content__left">
        Submitted {{ transaction.value.proposal_type.toLowerCase() }} proposal
      </div>
      <div class="tx__content__right">
        {{ initialDeposit.amount | atoms | prettyLong }}&nbsp;
        {{ initialDeposit.denom | viewDenom }}
      </div>
    </div>
    <div v-if="show === `details`" class="tx__content__information">
      Title&nbsp;<i>{{ transaction.value.title }}</i>
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
    show: {
      type: String,
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
