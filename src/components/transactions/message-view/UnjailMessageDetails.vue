<template>
  <div>
    <div v-if="show === `caption`" class="tx__content__caption">
      <p>Unjail</p>
    </div>
    <div v-if="show === `details`" class="tx__content__information">
      Name:
      <router-link :to="`staking/validators/${transaction.value.address}`">{{
        transaction.value.address | formatBech32
      }}</router-link>
    </div>
  </div>
</template>

<script>
import { formatBech32 } from "src/filters"

export default {
  name: `unjail-message-details`,
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
