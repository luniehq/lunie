<template>
  <div>
    <div class="tx__content__caption">
      <p>Voted&nbsp;{{ transaction.value.option }}</p>
    </div>
    <div class="tx__content__information">
      On
      <router-link :to="`/governance/${ransaction.value.proposal_id}`"
        >Proposal &#35;{{ transaction.value.proposal_id }}</router-link
      >
    </div>
  </div>
</template>

<script>
import { formatBech32 } from "src/filters"

export default {
  name: `vote-message-details`,
  filters: {
    formatBech32
  },
  props: {
    transaction: {
      type: Object,
      required: true
    },
    coin: {
      type: Object,
      required: true
    },
    validators: {
      type: Object,
      required: true
    }
  }
}
</script>
