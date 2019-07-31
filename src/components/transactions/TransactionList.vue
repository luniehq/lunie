<template>
  <div>
    <TransactionItem
      v-for="msg in transactions"
      :key="msg.key"
      :transaction="msg"
      :validators="validators"
      :address="address"
    />
  </div>
</template>

<script>
// import TransactionItem from "./TransactionItem"
import TransactionItem from "./TransactionItem"

export default {
  name: `transaction-list`,
  components: {
    TransactionItem
  },
  props: {
    transactions: {
      type: Array,
      required: true
    },
    address: {
      type: String,
      default: null
    },
    validators: {
      type: Object,
      required: true
    }
  }
}
</script>
