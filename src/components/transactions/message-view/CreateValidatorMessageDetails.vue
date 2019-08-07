<template>
  <div>
    <div class="tx__content__caption">
      <p>
        Create validator
        <b>{{ coin.amount | atoms | prettyLong }}</b>
        <span>{{ coin.denom | viewDenom }}</span>
      </p>
    </div>
    <div class="tx__content__information">
      Monikor&nbsp;
      <router-link
        :to="`staking/validators/${transaction.value.validator_address}`"
      >
        {{
          ransaction.value.validator_address | resolveValidatorName(validators)
        }}
      </router-link>
    </div>
  </div>
</template>

<script>
import { atoms, viewDenom, prettyLong } from "scripts/num.js"
import { resolveValidatorName } from "src/filters"
import { getCoin } from "scripts/transaction-utils"

export default {
  name: `create-validator-message-details`,
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
  },
  computed: {
    coin() {
      return getCoin(this.transaction)
    }
  }
}
</script>
