<template>
  <div class="tx__content">
    <TransactionIcon
      :transaction-group="transaction.group"
      :transaction-type="caption"
    />
    <div class="tx__content__left">
      {{ caption }}
      moniker&nbsp;
      <router-link
        :to="`staking/validators/${transaction.value.validator_address}`"
      >
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
  </div>
</template>

<script>
import { atoms, viewDenom, prettyLong } from "scripts/num.js"
import { resolveValidatorName } from "src/filters"
import TransactionIcon from "../TransactionIcon"

export default {
  name: `create-validator-message-details`,
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
      caption: `Create validator`
    }
  },
  computed: {
    validator() {
      return this.validators[this.transaction.value.validator_address] || false
    }
  }
}
</script>
