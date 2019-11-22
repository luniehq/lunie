<template>
  <div>
    <div v-if="show === `caption`" class="tx__content__caption">
      <div class="tx__content__left">
        Deposited
      </div>
      <div class="tx__content__right">
        {{ deposit.amount | atoms | prettyLong }}&nbsp;
        {{ deposit.denom | viewDenom }}
      </div>
    </div>
    <div v-if="show === `details`" class="tx__content__information">
      On
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
    deposit() {
      return this.transaction.value.amount[0]
    }
  }
}
</script>
