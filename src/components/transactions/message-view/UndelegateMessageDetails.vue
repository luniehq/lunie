<template>
  <div>
    <div class="tx__content__caption">
      <p>
        Undelegated
        <b>{{ coin.amount | atoms | prettyLong }}</b>
        <span>&nbsp;{{ coin.denom | viewDenom }}</span>
        <span v-if="transaction.liquidDate" class="tx-unbonding__time-diff"
          >&nbsp;{{ liquidDateCaption }}</span
        >
      </p>
    </div>
    <div class="tx__content__information">
      From&nbsp;
      <router-link :to="`/validators/${transaction.value.validator_address}`">
        {{
          transaction.value.validator_address | resolveValidatorName(validators)
        }}
      </router-link>
    </div>
  </div>
</template>

<script>
import moment from "moment"
import { atoms, viewDenom, prettyLong } from "scripts/num.js"
import { resolveValidatorName } from "src/filters"
import { getCoin } from "scripts/transaction-utils"

export default {
  name: `undelegate-message-details`,
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
    liquidDateCaption() {
      return `(liquid ${moment(this.transaction.liquidDate).fromNow()})`
    },
    coin() {
      return getCoin(this.transaction)
    }
  }
}
</script>

<style>
.tx__content__information,
.tx__content__information > * {
  display: flex;
  flex-direction: row;
}

.tx__content__information {
  font-size: 14px;
  color: var(--dim);
}

.tx__content__caption {
  line-height: 18px;
  font-size: 18px;
  color: var(--bright);
}
</style>
