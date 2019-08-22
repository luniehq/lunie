<template>
  <div>
    <div class="tx__content__caption">
      <p>
        Redelegated
        <b>{{ coin.amount | atoms | prettyLong }}</b>
        <span> {{ coin.denom | viewDenom }}</span>
      </p>
    </div>
    <div class="tx__content__information">
      From&nbsp;
      <router-link
        :to="`staking/validators/${transaction.value.validator_src_address}`"
      >
        {{
          transaction.value.validator_src_address
            | resolveValidatorName(validators)
        }} </router-link
      >To&nbsp;
      <router-link
        :to="`staking/validators/${transaction.value.validator_dst_address}`"
      >
        {{
          transaction.value.validator_dst_address
            | resolveValidatorName(validators)
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
  name: `begin-redelegate-message-details`,
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
