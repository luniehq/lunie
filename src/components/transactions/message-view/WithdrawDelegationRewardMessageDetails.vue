<template>
  <div class="tx__content">
    <TransactionIcon
      :transaction-group="transaction.group"
      :transaction-type="type"
    />
    <div class="tx__content__left">
      <h3>{{ caption }}</h3>
      <div v-if="getValidators.length > 0">
        <div v-for="validator in getValidators" :key="validator.name">
          <span>Rewards from&nbsp;</span>
          <router-link
            :to="`/staking/validators/${validator.operatorAddress}`"
            class="validator-link"
          >
            <img
              v-if="validator.picture"
              :src="validator.picture"
              class="validator-image"
              :alt="`validator logo for ` + validator.name"
            />
            {{ validator.operatorAddress | resolveValidatorName(validators) }}
          </router-link>
        </div>
      </div>
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
    getValidators() {
      if (this.transaction.value.length > 1) {
        let validators = []
        this.transaction.value.forEach(msg => {
          validators.push(this.validators[msg.value.validator_address] || {})
        })
        return validators
      }
      // hack for something I don't fully understand yet. a [{...}, [Observer]] structure coming up in Terra
      if (this.transaction.value.validator_address) {
        return [this.validators[this.transaction.value.validator_address]] || []
      } else {
        return [this.transaction.value[0].value.validator_address] || []
      }
    }
  }
}
</script>
