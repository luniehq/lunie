<template>
  <div class="tx__content">
    <TransactionIcon
      :transaction-group="transaction.group"
      :transaction-type="type"
    />
    <div class="tx__content__left">
      <h3>{{ caption }}</h3>
      <div v-if="getValidators && getValidators.length === 1">
        <span>Rewards from&nbsp;</span>
        <router-link
          :to="`/staking/validators/${transaction.value.validator_address}`"
          class="validator-link"
        >
          <img
            v-if="getValidators.picture"
            :src="getValidators.picture"
            class="validator-image"
            :alt="`validator logo for ` + getValidators.name"
          />
          {{
            transaction.value.validator_address
              | resolveValidatorName(validators)
          }}
        </router-link>
      </div>
      <div v-if="getValidators && getValidators.length > 1">
        <div v-for="validator in getValidators" :key="validator.name">
          <router-link
            :to="`/staking/validators/${transaction.value.validator_address}`"
            class="validator-link"
          >
            <Avatar
              v-if="!validator.picture || validator.picture === 'null'"
              class="validator-image"
              alt="generic validator logo - generated avatar from address"
              :address="validator.operatorAddress"
            />
            <img
              v-if="validator && validator.picture"
              :src="validator.picture"
              class="validator-image"
              :alt="`validator logo for ` + validator.name"
            />
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
import Avatar from "common/Avatar"

export default {
  name: `withdraw-delegation-reward-message-details`,
  filters: {
    atoms,
    viewDenom,
    prettyLong,
    resolveValidatorName
  },
  components: {
    TransactionIcon,
    Avatar
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
<style scoped>
.validator-margin {
  width: 92px;
  float: left;
  height: 15px;
}
</style>
