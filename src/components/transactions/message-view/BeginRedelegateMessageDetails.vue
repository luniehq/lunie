<template>
  <div class="tx__content">
    <TransactionIcon
      :transaction-group="transaction.group"
      :transaction-type="caption"
    />
    <div class="tx__content__left">
      {{ caption }}
      from&nbsp;
      <router-link
        :to="`staking/validators/${transaction.value.validator_src_address}`"
      >
        {{
          transaction.value.validator_src_address
            | resolveValidatorName(validators)
        }} </router-link
      >&nbsp;to&nbsp;
      <router-link
        :to="`staking/validators/${transaction.value.validator_dst_address}`"
      >
        {{
          transaction.value.validator_dst_address
            | resolveValidatorName(validators)
        }}
      </router-link>
    </div>
    <div class="tx__content__right">
      <p class="amount">
        {{ coin.amount | atoms | prettyLong }} {{ coin.denom | viewDenom }}
      </p>
    </div>
  </div>
</template>

<script>
import { atoms, viewDenom, prettyLong } from "scripts/num.js"
import { resolveValidatorName } from "src/filters"
import { getCoin } from "scripts/transaction-utils"
import TransactionIcon from "../TransactionIcon"

export default {
  name: `begin-redelegate-message-details`,
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
    validators: {
      type: Object,
      required: true
    }
  },
  data: () => {
    return {
      caption: `Restaked`
    }
  },
  computed: {
    coin() {
      return getCoin(this.transaction)
    }
  }
}
</script>
