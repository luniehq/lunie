<template>
  <div class="tx__content">
    <TransactionIcon
      :transaction-group="transaction.group"
      :transaction-type="caption"
    />
    <div class="tx__content__left">
      {{ caption }}
      from&nbsp;
      <router-link :to="`/validators/${transaction.value.validator_address}`">
        <img
          v-if="validator && validator.picture"
          :src="validator.picture"
          class="validator-image"
          :alt="`validator logo for ` + validator.name"
        />
        {{
          transaction.value.validator_address | resolveValidatorName(validators)
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
import moment from "moment"
import { atoms, viewDenom, prettyLong } from "scripts/num.js"
import { resolveValidatorName } from "src/filters"
import { getCoin } from "scripts/transaction-utils"
import TransactionIcon from "../TransactionIcon"

export default {
  name: `undelegate-message-details`,
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
      caption: `Unstaked`
    }
  },
  computed: {
    coin() {
      return getCoin(this.transaction)
    },
    validator() {
      return this.validators[this.transaction.value.validator_address] || false
    }
  }
}
</script>
