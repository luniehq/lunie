<template>
  <div class="tx__content">
    <TransactionIcon
      :transaction-group="transaction.group"
      :transaction-type="type"
    />
    <div v-if="getValidators && getValidators.length === 1">
      <div class="tx__content__left">
        <h3>{{ caption }}</h3>
        <span>Rewards from&nbsp;</span>
        <router-link
          :to="`/staking/validators/${transaction.value.validator_address}`"
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
          {{
            transaction.value.validator_address
              | resolveValidatorName(validators)
          }}
        </router-link>
      </div>
    </div>
    <div
      v-if="getValidators && getValidators.length > 1"
      class="validators-images-row"
    >
      <div class="tx__content__left multi-claim-reward-row">
        <h3 class="multi-claim-reward-h3">{{ caption }}</h3>
        <div v-for="validator in getValidators" :key="validator.name">
          <router-link
            :to="`/staking/validators/${transaction.value.validator_address}`"
            class="validator-link"
          >
            <div
              v-if="!validator.picture || validator.picture === 'null'"
              class="row-validator-image"
            >
              <Avatar
                class="validator-image validator-avatar"
                alt="generic validator logo - generated avatar from address"
                :address="validator.operatorAddress"
              />
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
            </div>
          </router-link>
        </div>
        <span class="multi-claim-reward-show">Show</span>
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
.validators-images-row {
  display: flex;
  flex-direction: row;
}
.multi-claim-reward-row {
  display: flex;
}
.multi-claim-reward-h3 {
  margin-right: 20px;
}
.row-validator-image {
  float: left;
  padding: 5px;
}
.validator-image {
  border-radius: 100%;
  padding: -1px;
  height: 1rem;
  width: 1rem;
  vertical-align: middle;
  margin: 0 2px 2px 2px;
}
.validator-avatar {
  margin: 3px 4px 0 4px;
}
.multi-claim-reward-show {
  margin-left: 40px;
  margin-top: 5px;
  color: var(--link);
}
.multi-claim-reward-show:hover {
  color: var(--link-hover);
}
</style>
