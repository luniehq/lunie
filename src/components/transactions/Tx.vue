<template>
  <div>
    <TransactionIcon :transaction-type="transaction.type"></TransactionIcon>
    <TransactionCaption :transaction="transaction"></TransactionCaption>
    <TransactionDetails :transaction="transaction"></TransactionDetails>
    <NetworkFeeMetaData :fees="transaction.fees"></NetworkFeeMetaData>
  </div>
</template>

<script>
import TransactionIcon from "./TransactionIcon"
import TransactionCaption from "./TransactionCaption"
import TransactionDetails from "./TransactionDetails"
import NetworkFeeMetaData from "./NetworkFeeMetaData"

export default {
  name: `tx`,
  components: {
    TransactionIcon,
    TransactionCaption,
    TransactionDetails,
    NetworkFeeMetaData
  },
  props: {
    transaction: {
      type: Object,
      required: true
    }
  }
}
</script>

<style>
</style>
