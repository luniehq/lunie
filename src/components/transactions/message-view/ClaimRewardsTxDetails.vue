<template>
  <div class="claim-rewards-wrapper">
    <div class="tx__content">
      <TransactionIcon :transaction-type="type" />
      <div
        class="tx__content__left"
        :class="{
          responsiveControllerMobileTrue:
            getValidators.length > 1 && !multiClaimShow
        }"
      >
        <h3 :class="{ multiClaimRewardH3: multiClaimShow }">{{ caption }}</h3>
        <div v-if="getValidators" class="validators-images-row">
          <span
            v-if="!multiClaimShow && getValidators.length === 1"
            class="rewards-from-span"
            >Rewards from</span
          >
          <div
            :class="{
              multiClaimRewardRow: getValidators.length > 1,
              multiClaimRewardRowOpen: multiClaimShow,
              reponsiveControllerDesktop:
                getValidators.length > 1 && !multiClaimShow
            }"
          >
            <div
              :class="{
                multiClaimValidatorList:
                  getValidators.length > 1 && !multiClaimShow,
                validatorsToggle: multiClaimShow
              }"
            >
              <div
                v-for="(validator, index) in getValidators"
                :key="validator.name.concat(`-${index}`)"
                class="claimValidator"
                :class="{
                  singleValidatorRewardRow:
                    getValidators.length === 1 && !multiClaimShow
                }"
              >
                <router-link
                  :to="
                    multiClaimShow
                      ? `/staking/validators/${validator.operatorAddress}`
                      : ''
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
                      v-if="multiClaimShow || getValidators.length === 1"
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
                      v-if="multiClaimShow || getValidators.length === 1"
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
            <div
              v-if="multiClaimShow && transaction.details.amounts.length > 1"
            >
              <div
                v-for="coin in transaction.details.amounts"
                :key="coin.denom"
              >
                <p class="multi-claim-reward-coin">
                  {{ coin.amount | prettyLong }}&nbsp; {{ coin.denom }}
                </p>
              </div>
            </div>
            <div
              v-if="multiClaimShow && transaction.details.amounts.length === 1"
              class="single-reward-coin"
            >
              <p class="multi-claim-reward-coin">
                {{ transaction.details.amounts[0].amount | prettyLong }}&nbsp;
                {{ transaction.details.amounts[0].denom }}
              </p>
            </div>
          </div>
        </div>
        <div class="tx-content-right">
          <div
            v-if="!multiClaimShow && transaction.details.amounts.length === 1"
          >
            <p>
              {{ transaction.details.amounts[0].amount | prettyLong }}&nbsp;
              {{ transaction.details.amounts[0].denom }}
            </p>
          </div>
          <div v-if="!multiClaimShow && transaction.details.amounts.length > 1">
            <p>Show multiple rewards</p>
          </div>
        </div>
      </div>
    </div>
    <div
      v-if="!multiClaimShow && getValidators.length > 1"
      class="multiClaimRewardRow reponsiveControllerMobile"
    >
      <div class="responsiveMultiClaimValidatorList">
        <div
          v-for="(validator, index) in getValidators"
          :key="validator.name.concat(`-${index}`)"
          class="reponsiveClaimValidator"
        >
          <router-link
            :to="
              multiClaimShow
                ? `/staking/validators/${validator.operatorAddress}`
                : ''
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
                v-if="multiClaimShow || getValidators.length === 1"
                class="validator-span"
              >
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
              <span
                v-if="multiClaimShow || getValidators.length === 1"
                class="validator-span"
              >
                {{
                  validator.operatorAddress | resolveValidatorName(validators)
                }}
              </span>
            </div>
          </router-link>
        </div>
      </div>
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
    },
    multiClaimShow() {
      // here we prevent any changes for the particular case of one validator and one single denom
      return this.getValidators.length === 1 &&
        this.transaction.details.amounts.length === 1
        ? false
        : this.show
    }
  }
}
</script>
<style scoped>
.claim-rewards-wrapper {
  display: block;
  width: 100%;
}
.tx__icon {
  align-self: flex-start;
}
.tx__content__left {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}
.tx-content-right {
  padding-right: 1rem;
}
.multiClaimRewardH3 {
  margin-top: 0.25rem;
  align-self: flex-start;
}
.validators-images-row {
  display: flex;
  flex: 3;
  align-items: center;
  justify-content: center;
}
.singleValidatorRewardRow {
  margin: 0 !important;
}
.multiClaimRewardRow {
  display: flex;
  justify-content: space-around;
  align-items: center;
  width: 100%;
}
.multiClaimRewardRowOpen {
  display: flex;
  justify-content: space-between;
  width: 100%;
}
.multiClaimValidatorList {
  display: flex;
  align-items: center;
  justify-content: center;
}
.validatorsToggle {
  flex-direction: column;
  display: block;
  margin-left: 1rem;
}
.multi-claim-reward-coin {
  margin: 0.5rem 0;
}
.single-reward-coin {
  align-self: flex-start;
}
.claimValidator {
  margin: 0 1rem;
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
.multi-claim-reward-multiClaimShow {
  margin-left: 40px;
  color: var(--link);
}
.multi-claim-reward-multiClaimShow:hover {
  color: var(--link-hover);
}
.tx a {
  margin-left: 0.1rem;
}
.multiClaimValidatorList span {
  padding-right: 0.2rem;
}
.reponsiveControllerMobile {
  display: none;
}
.responsiveMultiClaimValidatorList {
  display: flex;
  width: 100%;
  justify-content: center;
}
.reponsiveClaimValidator {
  margin: 0 2rem;
}
@media screen and (max-width: 767px) {
  .tx-content-right {
    padding-right: 0;
  }
  .reponsiveControllerDesktop {
    display: none;
  }
  .reponsiveControllerMobile {
    display: flex;
    padding-bottom: 1rem;
  }
  .responsiveControllerMobileTrue {
    padding-bottom: 0.5rem;
  }
}
@media screen and (max-width: 576px) {
  .responsiveMultiClaimValidatorList {
    justify-content: space-evenly;
  }
  .reponsiveClaimValidator {
    margin: 0;
  }
  .rewards-from-span {
    display: none;
  }
}
</style>
