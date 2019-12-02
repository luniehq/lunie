<template>
  <div class="tx__content">
    <TransactionIcon
      :transaction-group="transaction.group"
      :transaction-type="type"
    />
    <div class="tx__content__left">
      <h3>{{ caption }}</h3>
      to {{ transaction.value.withdraw_address }}
    </div>
  </div>
</template>

<script>
import { atoms, viewDenom, prettyLong } from "scripts/num.js"
import TransactionIcon from "../TransactionIcon"

export default {
  name: `set-withdraw-address-message-details`,
  filters: {
    atoms,
    viewDenom,
    prettyLong
  },
  components: {
    TransactionIcon
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
  data: () => {
    return {
      type: `Update`,
      caption: `Update withdraw address`
    }
  }
}
</script>
