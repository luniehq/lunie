<template>
  <div>
    <div class="tx__content__caption">
      <p>Edit validator</p>
    </div>
    <div class="tx__content__information">
      Monikor&nbsp;
      <router-link
        :to="`staking/validators/${transaction.value.validator_address}`"
        >{{ validatorReference }}</router-link
      >
    </div>
  </div>
</template>

<script>
import { atoms, viewDenom, prettyLong } from "scripts/num.js"
import { formatBech32 } from "src/filters"

export default {
  name: `edit-validator-message-details`,
  filters: {
    atoms,
    viewDenom,
    prettyLong
  },
  props: {
    transaction: {
      type: Object,
      required: true
    },
    coin: {
      type: Object,
      required: true
    },
    validators: {
      type: Object,
      required: true
    }
  },
  computed: {
    validatorReference() {
      if (this.validators[this.transaction.value.validator_address]) {
        return this.validators[this.transaction.value.validator_address]
          .description.moniker
      }
      return formatBech32(this.transaction.value.validator_address)
    }
  }
}
</script>
