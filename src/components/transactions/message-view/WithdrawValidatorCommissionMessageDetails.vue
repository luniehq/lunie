<template>
  <div>
    <div class="tx__content__caption">
      <p>Withdraw validator commission</p>
    </div>
    <div class="tx__content__information">
      From&nbsp;
      <router-link
        :to="`staking/validators/${transaction.value.validator_address}`"
        >{{
          transaction.value.validator_address | resolveValidatorName(validators)
        }}</router-link
      >
    </div>
  </div>
</template>

<script>
import { atoms, viewDenom, prettyLong } from "scripts/num.js"
import { resolveValidatorName } from "src/filters"

export default {
  name: `withdraw-validator-commission-message-details`,
  filters: {
    atoms,
    viewDenom,
    prettyLong,
    resolveValidatorName
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
