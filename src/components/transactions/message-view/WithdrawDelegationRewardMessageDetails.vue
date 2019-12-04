<template>
  <div class="tx__content">
    <TransactionIcon
      :transaction-group="transaction.group"
      :transaction-type="type"
    />
    <div class="tx__content__left">
      <h3>{{ caption }}</h3>
      <span>Rewards from&nbsp;</span>
      <router-link
        :to="`staking/validators/${transaction.value[0].validator_address}`"
        class="validator-link"
      >
        <img
          v-if="validator && validator.picture"
          :src="validator.picture"
          class="validator-image"
          :alt="`validator logo for ` + validator.name"
        />
        {{
          transaction.value[0].validator_address | resolveValidatorName(validators)
        }}
      </router-link>
      <span v-if="transaction.value.length > 1"> and {{ transaction.value.length -1 }} others</span>
    </div>
  </div>
</template>

<script>
import { atoms, viewDenom, prettyLong } from "scripts/num.js"
import { resolveValidatorName } from "src/filters"
import TransactionIcon from "../TransactionIcon"

export default {
  name: `withdraw-delegation-reward-message-details`,
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
      type: `Claimed`,
      caption: `Claimed`
    }
  },
  computed: {
    // Always return an array
    validator() {
      console.log(this.transaction.value)
      if (Array.isArray(this.transaction.value)) {
        return this.validators[this.transaction.value[0].validator_address] || false
      } else {
        return [ this.validators[this.transaction.value.validator_address] ] || false
      }
    }
  }
}
</script>
