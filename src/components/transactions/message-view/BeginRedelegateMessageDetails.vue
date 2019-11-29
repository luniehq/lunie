<template>
  <div class="tx__content">
    <TransactionIcon
      :transaction-group="transaction.group"
      :transaction-type="caption"
    />
    <div class="tx__content__left">
      <h3>{{ caption }}</h3>
      <span>From&nbsp;</span>
      <router-link
        :to="`staking/validators/${transaction.value.validator_src_address}`"
      >
        <img
          v-if="sourceValidator && sourceValidator.picture"
          :src="sourceValidator.picture"
          class="validator-image"
          :alt="`validator logo for ` + sourceValidator.name"
        />
        {{
          transaction.value.validator_src_address
            | resolveValidatorName(validators)
        }} </router-link
      ><i class="material-icons arrow">arrow_right_alt</i>
      <router-link
        :to="`staking/validators/${transaction.value.validator_dst_address}`"
      >
        <img
          v-if="destinationValidator && destinationValidator.picture"
          :src="destinationValidator.picture"
          class="validator-image"
          :alt="`validator logo for ` + destinationValidator.name"
        />
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
    },
    sourceValidator() {
      return (
        this.validators[this.transaction.value.validator_src_address] || false
      )
    },
    destinationValidator() {
      return (
        this.validators[this.transaction.value.validator_dst_address] || false
      )
    }
  }
}
</script>
<style>
.arrow {
  vertical-align: middle;
  font-size: 16px;
}
</style>
