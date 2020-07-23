<template>
  <div class="tx__content">
    <TransactionIcon :transaction-type="type" />
    <div class="tx__content__left">
      <h3>{{ caption }}</h3>
      <span
        ><i class="italic">{{ transaction.details.voteOption }}</i>
        &nbsp;on&nbsp;</span
      >
      <router-link
        :to="{
          name: 'proposal',
          params: { proposalId: String(transaction.details.proposalId) },
        }"
        >Proposal &#35;{{ transaction.details.proposalId }}</router-link
      >
    </div>
  </div>
</template>

<script>
import TransactionIcon from "../TransactionIcon"

export default {
  name: `vote-tx-details`,
  components: {
    TransactionIcon,
  },
  props: {
    transaction: {
      type: Object,
      required: true,
    },
    validators: {
      type: Object,
      required: true,
    },
  },
  data: () => {
    return {
      type: `Voted`,
      caption: `Voted`,
    }
  },
}
</script>
<style scoped>
.italic {
  font-style: italic;
}
</style>
