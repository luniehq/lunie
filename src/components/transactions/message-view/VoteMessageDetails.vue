<template>
  <div>
    <div v-if="show === `caption`" class="tx__content__caption">
      <p>Voted&nbsp;{{ transaction.value.option }}</p>
    </div>
    <div v-if="show === `details`" class="tx__content__information">
      On&nbsp;
      <router-link :to="`/governance/${transaction.value.proposal_id}`"
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
    show: {
      type: String,
      required: true
    },
    validators: {
      type: Object,
      required: true
    }
  }
}
</script>
