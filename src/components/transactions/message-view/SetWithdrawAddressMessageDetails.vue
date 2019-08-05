<template>
  <div>
    <div class="tx__content__caption">
      <p>Update withdraw address</p>
    </div>
    <div class="tx__content__information">To {{ transaction.value.withdraw_address }}</div>
  </div>
</template>

<script>
import { atoms, viewDenom, prettyLong } from "scripts/num.js"

export default {
  name: `set-withdraw-address-message-details`,
  filters: {
    atoms,
    viewDenom,
    prettyLong
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
