<template>
  <div>
    <div class="tx__content__caption">
      <p>
        Delegated
        <b>{{ coin.amount | atoms | prettyLong }}</b>
        <span>&nbsp;{{ coin.denom | viewDenom }}</span>
      </p>
    </div>
    <div class="tx__content__information">
      To&nbsp;
      <router-link
        :to="`staking/validators/${transaction.value.validator_address}`"
      >
        {{
          transaction.value.validator_address | resolveValidatorName(validators)
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
  name: `delegate-message-details`,
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
  mounted() {
    console.log(this.transaction)
  },
  computed: {
    coin() {
      return getCoin(this.transaction)
    }
  }
}
</script>
