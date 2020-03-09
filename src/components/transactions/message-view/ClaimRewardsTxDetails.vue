<template>
  <div class="tx__content">
    <TransactionIcon :transaction-type="type" />
    <template v-if="getValidators && getValidators.length === 1">
      <div class="tx__content__left">
        <h3>{{ caption }}</h3>
        <div class="multi-claim-reward-row">
          <span>Rewards from</span>
          <router-link
            :to="`/staking/validators/${transaction.details.from[0]}`"
            class="validator-link"
          >
            <Avatar
              v-if="
                !getValidators[0].picture || getValidators[0].picture === 'null'
              "
              class="validator-image"
              alt="generic validator logo - generated avatar from address"
              :address="getValidators[0].operatorAddress"
            />
            <img
              v-if="getValidators[0].picture"
              :src="getValidators[0].picture"
              class="validator-image"
              :alt="`validator logo for ` + getValidators[0].name"
            />
            {{ transaction.details.from[0] | resolveValidatorName(validators) }}
          </router-link>
        </div>
      </div>
      <div class="tx__content__right">
        <p class="amount">
          {{ transaction.details.amount.amount | prettyLong }}&nbsp;
          {{ transaction.details.amount.denom }}
        </p>
      </div>
    </template>
    <template
      v-if="getValidators && getValidators.length > 1"
      class="validators-images-row"
    >
      <div class="tx__content__left multi-claim-reward-row">
        <h3 class="multi-claim-reward-h3">{{ caption }}</h3>
        <div class="multi-claim-reward-row" :class="{ validatorsToggle: show }">
          <div
            v-for="(validator, index) in getValidators"
            :key="validator.name.concat(`-${index}`)"
          >
            <router-link
              :to="`/staking/validators/${validator.operatorAddress}`"
              class="validator-link"
            >
              <div
                v-if="!validator.picture || validator.picture === 'null'"
                class="row-validator-image"
              >
                <Avatar
                  class="validator-image"
                  alt="generic validator logo - generated avatar from address"
                  :address="validator.operatorAddress"
                />
                <span v-if="show" class="validator-span">
                  {{
                    validator.operatorAddress | resolveValidatorName(validators)
                  }}
                </span>
              </div>
              <div
                v-if="validator && validator.picture"
                class="row-validator-image"
              >
                <img
                  :src="validator.picture"
                  class="validator-image"
                  :alt="`validator logo for ` + validator.name"
                />
                <span v-if="show" class="validator-span">
                  {{
                    validator.operatorAddress | resolveValidatorName(validators)
                  }}
                </span>
              </div>
            </router-link>
          </div>
          <span v-if="!show" class="multi-claim-reward-show">Show</span>
        </div>
      </div>
      <div class="tx__content__right">
        <p class="amount">
          {{ transaction.details.amount.amount | prettyLong }}&nbsp;
          {{ transaction.details.amount.denom }}
        </p>
      </div>
    </template>
  </div>
</template>

<script>
import { prettyLong } from "scripts/num.js"
import { resolveValidatorName } from "src/filters"
import TransactionIcon from "../TransactionIcon"
import Avatar from "common/Avatar"

export default {
  name: `claim-rewards-tx-details`,
  filters: {
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
    },
    show: {
      type: Boolean,
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
      return this.transaction.details.from.map(validatorAddress => {
        return this.validators[validatorAddress] || {}
      })
    }
  }
}
</script>
<style scoped>
.validators-images-row {
  display: flex;
  flex-direction: row;
}
.multi-claim-reward-row {
  display: flex;
  align-items: center;
}
.multi-claim-reward-h3 {
  margin-right: 20px;
}
.row-validator-image {
  padding: 5px;
  display: flex;
  align-items: center;
}
.validator-image {
  border-radius: 100%;
  float: left;
}
.validator-span {
  float: left;
  margin-left: 5px;
}
.multi-claim-reward-show {
  margin-left: 40px;
  color: var(--link);
}
.multi-claim-reward-show:hover {
  color: var(--link-hover);
}
.multi-claim-reward-row.validatorsToggle {
  display: block;
}
.tx a {
  margin-left: 0.1rem;
}
.multi-claim-reward-row span {
  padding-right: 0.2rem;
}
</style>
