<template>
  <div class="tx__content">
    <TransactionIcon
      :transaction-group="transaction.group"
      :transaction-type="caption"
    />
    <div class="tx__content__left">
      {{ caption }}
      moniker&nbsp;
      <router-link :to="`staking/validators/${transaction.value.address}`">
        <img
          v-if="validator && validator.picture"
          :src="validator.picture"
          class="validator-image"
          :alt="`validator logo for ` + validator.name"
        />
        {{ transaction.value.address | resolveValidatorName(validators) }}
      </router-link>
    </div>
    <div class="tx__content__right">
      <p class="amount">
        {{ fee.amount | atoms | prettyLong }}&nbsp;
        {{ fee.denom | viewDenom }}
      </p>
    </div>
  </div>
</template>

<script>
import { atoms, viewDenom, prettyLong } from "scripts/num.js"
import { resolveValidatorName } from "src/filters"
import TransactionIcon from "../TransactionIcon"

export default {
  name: `edit-validator-message-details`,
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
      caption: `Edit validator`
    }
  },
  computed: {
    fee() {
      return this.transaction.fee.amount[0]
    },
    validator() {
      return this.validators[this.transaction.value.validator_address] || false
    }
  }
}
</script>
