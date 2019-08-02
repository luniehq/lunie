<template>
  <div>
    <div class="tx__content__caption">
      <p>
        Redelegated
        <b>{{ coin.amount | atoms | prettyLong }}</b>
        <span>{{ coin.denom | viewDenom }}</span>
      </p>
    </div>
    <div class="tx__content__information">
      From&nbsp;
      <router-link
        :to="`staking/validators/${transaction.value.validator_src_address}`"
        >{{
          validatorReference(transaction.value.validator_src_address)
        }}</router-link
      >To&nbsp;
      <router-link
        :to="`staking/validators/${transaction.value.validator_dst_address}`"
        >{{
          validatorReference(transaction.value.validator_dst_address)
        }}</router-link
      >
    </div>
  </div>
</template>

<script>
import { atoms, viewDenom, prettyLong } from "scripts/num.js"
import { formatBech32 } from "src/filters"

export default {
  name: `begin-redelegate-message-details`,
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
  methods: {
    validatorReference(address) {
      if (this.validators[address]) {
        return this.validators[address].description.moniker
      }
      return formatBech32(address)
    }
  }
}
</script>
