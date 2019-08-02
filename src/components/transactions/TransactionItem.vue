<template>
  <div class="tx">
    <TransactionIcon :transaction-group="transaction.group"></TransactionIcon>
    <TransactionDetails
      :hide-meta-data="hideMetaData"
      :transaction="transaction"
      :validators="validators"
      :address="address"
    />
  </div>
</template>

<script>
import TransactionIcon from "./TransactionIcon"
import TransactionDetails from "./TransactionDetails"

export default {
  name: `tx-item`,
  components: {
    TransactionIcon,
    TransactionDetails
  },
  props: {
    transaction: {
      type: Object,
      required: true
    },
    validators: {
      type: Object,
      required: true
    },
    address: {
      type: String,
      default: null
    },
    hideMetaData: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style>
.tx {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  border: 1px solid var(--bc-dim);
  background: var(--app-fg);
  width: 100%;
  font-weight: 300;
  position: relative;
}

.tx .copied {
  position: absolute;
  bottom: 0;
}

.tx b {
  font-weight: 500;
}
</style>
