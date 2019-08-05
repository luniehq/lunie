<template>
  <div>
    <div class="tx__content__caption">
      <p>Unjail</p>
    </div>
    <div class="tx__content__information">
      Moniker:
      <router-link
        :to="`staking/validators/${transaction.value.address}`"
      >{{ transaction.value.address | formatBech32 }}</router-link>
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
    validators: {
      type: Object,
      required: true
    }
  }
}
</script>
