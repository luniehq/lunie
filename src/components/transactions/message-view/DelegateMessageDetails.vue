<template>
  <div>
    <div v-if="show === `caption`" class="tx__content">
      <TransactionIcon
        :transaction-group="transaction.group"
        :transaction-type="caption"
      />
      <div class="tx__content__left">
        {{ caption }}
      </div>
      <div class="tx__content__right">
        {{ coin.amount | atoms | prettyLong }} {{ coin.denom | viewDenom }}
      </div>
    </div>
    <div v-if="show === `details`" class="tx__content__information">
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
import TransactionIcon from "../TransactionIcon"

export default {
  name: `delegate-message-details`,
  filters: {
    atoms,
    viewDenom,
    prettyLong,
    resolveValidatorName
  },
  components: {
    TransactionIcon
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
  },
  data: () => {
    return {
      caption: `Staked`
    }
  },
  computed: {
    coin() {
      return getCoin(this.transaction)
    }
  }
}
</script>
