<template>
  <div class="tx__content">
    <TransactionIcon :transaction-type="type" />
    <div class="tx__content__left">
      <div class="tx__claim__header">
        <h3 class="multi-claim-reward-h3">{{ caption }}</h3>
        <div class="tx__content__right">
          <div v-if="transaction.details.amounts.length === 1">
            <p>
              {{ transaction.details.amounts[0].amount | prettyLong }}&nbsp;
              {{ transaction.details.amounts[0].denom }}
            </p>
          </div>
          <div v-else-if="!show && transaction.details.amounts.length > 1">
            <p>Show multiple rewards</p>
          </div>
        </div>
      </div>
      <template v-if="getValidators" class="validators-images-row">
        <span v-if="!show">Rewards from</span>
        <div
          :class="{
            multiClaimRewardRow: getValidators.length > 1 || show,
            singleValidatorRewardRow: getValidators.length === 1 && !show
          }"
        >
          <div
            :class="{
              multiClaimValidatorList: getValidators.length > 1,
              validatorsToggle: getValidators.length > 1 && show,
              singleValidatorRewardRow: getValidators.length === 1
            }"
          >
            <div
              v-for="(validator, index) in getValidators"
              :key="validator.name.concat(`-${index}`)"
              :class="{
                claimValidator: getValidators.length > 1,
                singleValidatorRewardRow: getValidators.length === 1
              }"
            >
              <router-link
                :to="
                  show ? `/staking/validators/${validator.operatorAddress}` : ''
                "
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
                  <span
                    v-if="show || getValidators.length === 1"
                    class="validator-span"
                  >
                    {{
                      validator.operatorAddress
                        | resolveValidatorName(validators)
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
                  <span
                    v-if="show || getValidators.length === 1"
                    class="validator-span"
                  >
                    {{
                      validator.operatorAddress
                        | resolveValidatorName(validators)
                    }}
                  </span>
                </div>
              </router-link>
            </div>
          </div>
          <div v-if="show && transaction.details.amounts.length > 1">
            <div
              v-for="coin in transaction.details.amounts"
              :key="coin.denom"
              class="amount"
            >
              <p class="multi-claim-reward-coin">
                {{ coin.amount | prettyLong }}&nbsp; {{ coin.denom }}
              </p>
            </div>
          </div>
        </div>
      </template>
    </div>
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
      if (this.validators && Object.keys(this.validators).length > 0) {
        return this.transaction.details.from.map(validatorAddress => {
          return this.validators[validatorAddress] || {}
        })
      } else {
        return []
      }
    }
  }
}
</script>
<style scoped>
.tx__content__left {
  width: 100%;
}
.tx__claim__header {
  display: flex;
  align-items: center;
}
.validators-images-row {
  display: flex;
  flex-direction: row;
}
.singleValidatorRewardRow {
  display: inline;
}
.multiClaimRewardRow {
  display: flex;
  justify-content: space-around;
  align-items: center;
}
.multiClaimValidatorList {
  display: flex;
  align-items: center;
  justify-content: center;
}
.multiClaimValidatorList.validatorsToggle {
  flex-direction: column;
  display: block;
}
.multi-claim-reward-h3 {
  margin-right: 20px;
}
.multi-claim-reward-coin {
  margin: 0.5rem 0;
}
.claimValidator {
  margin: 0 2rem;
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
.tx a {
  margin-left: 0.1rem;
}
.multiClaimValidatorList span {
  padding-right: 0.2rem;
}
@media screen and (max-width: 767px) {
  .multiClaimValidatorList {
    justify-content: space-evenly;
  }
  .claimValidator {
    margin: 0;
  }
}
</style>
