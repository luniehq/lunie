<template>
  <div class="tx__content">
    <TransactionIcon :transaction-type="type" />
    <div class="tx__content__left">
      <h3>{{ caption }}</h3>
      <!-- this is just a demo! -->
      <span
        >See transaction in
        <a
          :href="`https://gaia.bigdipper.live/transactions/${transaction.hash}`"
          target="_blank"
          >Block Explorer</a
        ></span
      >
    </div>
  </div>
</template>

<script>
import TransactionIcon from "../TransactionIcon"

export default {
  name: `unknown-tx-details`,
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
      type: `Submitted`,
      caption: `Unknown`
    }
  }
}
</script>
<style scoped>
.italic {
  font-style: italic;
}
</style>
