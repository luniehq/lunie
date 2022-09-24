<template>
  <div class="claim-rewards-wrapper">
    <div class="tx__content">
      <TransactionIcon :transaction-type="type" />
      <div class="tx__content__left">
        <h3>{{ type }}</h3>
        <div class="validator-row">
          <span>From</span>
          <router-link
            v-for="(validator, index) in getValidators"
            :key="validator.operatorAddress.concat(`-${index}`)"
            :to="{
              name: `validator`,
              params: {
                validator: validator.operatorAddress,
                networkId: network,
              },
            }"
            class="validator-link"
          >
            <img
              v-if="validator && validator.picture"
              :src="validator.picture"
              class="validator-image"
              :alt="`validator logo for ` + validator.name"
            />
            <Avatar
              v-else
              class="validator-image"
              alt="generic validator logo - generated avatar from address"
              :address="validator.operatorAddress"
            />
          </router-link>
        </div>
      </div>
    </div>

    <div class="tx__content__right">
      <div v-if="transaction.details.amounts.length > 1">
        <p class="amount">Multiple amounts</p>
      </div>
      <template v-else>
        <p
          v-for="reward in transaction.details.amounts"
          :key="reward.denom"
          class="amount"
        >
          {{ reward.amount | prettyLong }}&nbsp; {{ reward.denom }}
        </p>
      </template>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex"
import { prettyLong } from "scripts/num.js"
import { resolveValidatorName } from "src/filters"
import TransactionIcon from "../TransactionIcon"
import Avatar from "common/Avatar"

export default {
  name: `claim-rewards-tx-details`,
  filters: {
    prettyLong,
    resolveValidatorName,
  },
  components: {
    TransactionIcon,
    Avatar,
  },
  props: {
    transaction: {
      type: Object,
      required: true,
    },
    validators: {
      type: Object,
      required: true,
    },
    show: {
      type: Boolean,
      required: true,
    },
  },
  data: () => {
    return {
      type: `Claimed`,
    }
  },
  computed: {
    ...mapGetters([`isExtension`, `network`]),
    getValidators() {
      if (this.validators && Object.keys(this.validators).length > 0) {
        return this.transaction.details.from.map((validatorAddress) => {
          return this.validators[validatorAddress] || {}
        })
      } else {
        return []
      }
    },
  },
}
</script>
<style scoped>
.claim-rewards-wrapper {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.validator-row {
  display: flex;
  align-items: center;
}

.validator-link {
  padding-left: 0.25rem;
}
</style>
