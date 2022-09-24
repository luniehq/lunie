<template>
  <div class="tx__content">
    <TransactionIcon :transaction-type="type" />
    <div class="tx__content__left">
      <h3>{{ type }}</h3>
      <template v-if="toYourself">
        <span>To yourself —&nbsp;</span>
        <Address :address="sessionAddress" />
      </template>
      <template v-else-if="sentFromSessionAddress">
        <span>To&nbsp;</span>
        <Address :address="transaction.details.to[0]" />
      </template>
      <template v-else>
        <span>From&nbsp;</span>
        <Address :address="transaction.details.from[0]" />
      </template>
    </div>
    <div class="tx__content__right">
      <p class="amount" v-if="transaction.details.amounts"> <!-- lunie 3 format -->
        {{ transaction.details.amounts[0].amount | prettyLong }}&nbsp;
        {{ transaction.details.amounts[0].denom }}
      </p>
      <p class="amount" v-else> <!-- old format -->
        {{ transaction.details.amount.amount | prettyLong }}&nbsp;
        {{ transaction.details.amount.denom }}
      </p>
    </div>
  </div>
</template>

<script>
import { prettyLong } from "scripts/num.js"
import Address from "common/Address"
import TransactionIcon from "../TransactionIcon"

export default {
  name: `send-tx-details`,
  filters: {
    prettyLong,
  },
  components: {
    Address,
    TransactionIcon,
  },
  props: {
    transaction: {
      type: Object,
      required: true,
    },
    sessionAddress: {
      type: String,
      required: false,
      default: null,
    },
  },
  computed: {
    toYourself() {
      return this.transaction.details.from[0] === this.transaction.details.to[0]
    },
    sentFromSessionAddress() {
      return this.transaction.details.from[0] === this.sessionAddress
    },
    type() {
      if (this.transaction.details.to[0] === this.sessionAddress) {
        return "Received"
      } else {
        return "Sent"
      }
    },
  },
}
</script>
