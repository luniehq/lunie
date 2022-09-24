<template>
  <div class="tx__content">
    <TransactionIcon :transaction-type="type" />
    <div class="tx__content__left">
      <h3>{{ caption }}</h3>
      <span>From&nbsp;</span>
      <router-link :to="`/staking/validators/${transaction.details.from[0]}`">
        <img
          v-if="sourceValidator && sourceValidator.picture"
          :src="sourceValidator.picture"
          class="validator-image"
          :alt="`validator logo for ` + validator.name"
        />
        {{
          transaction.details.from[0] | resolveValidatorName(validators)
        }} </router-link
      ><i class="material-icons notranslate arrow">arrow_right_alt</i>
      <router-link
        :to="{
          name: 'validator',
          params: { validator: transaction.details.to[0] },
        }"
      >
        <img
          v-if="destinationValidator && destinationValidator.picture"
          :src="destinationValidator.picture"
          class="validator-image"
          :alt="
            `validator logo for ` +
            (destinationValidator.name || destinationValidator.operatorAddress)
          "
        />
        {{ transaction.details.to[0] | resolveValidatorName(validators) }}
      </router-link>
    </div>
    <div class="tx__content__right">
      <p class="amount">
        {{ transaction.details.amount.amount | prettyLong }}&nbsp;
        {{ transaction.details.amount.denom }}
      </p>
    </div>
  </div>
</template>

<script>
import { prettyLong } from "scripts/num.js"
import { resolveValidatorName } from "src/filters"
import TransactionIcon from "../TransactionIcon"

export default {
  name: `restake-tx-details`,
  filters: {
    prettyLong,
    resolveValidatorName,
  },
  components: {
    TransactionIcon,
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
  },
  data: () => {
    return {
      type: `Restaked`,
      caption: `Restaked`,
    }
  },
  computed: {
    sourceValidator() {
      return this.validators[this.transaction.details.from[0]] || false
    },
    destinationValidator() {
      return this.validators[this.transaction.details.to[0]] || false
    },
  },
}
</script>
<style>
.arrow {
  vertical-align: middle;
  font-size: 16px;
}
</style>
