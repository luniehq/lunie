<template>
  <div>
    <div v-if="show === `caption`" class="tx__content">
      <TransactionIcon
        :transaction-group="transaction.group"
        :transaction-type="caption"
      />
      <div class="tx__content__left">
        {{ caption }}
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
    show: {
      type: String,
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
