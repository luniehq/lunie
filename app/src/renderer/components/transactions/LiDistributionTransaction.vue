<template>
  <li-transaction
    :color="`#F2B134`"
    :time="transaction.time"
    :block="transaction.height"
  >
    <template v-if="txType === `cosmos-sdk/MsgWithdrawDelegationReward`">
      <div slot="caption">
        Withdraw rewards
      </div>
      <div slot="details">
        From<router-link :to="url + '/' + tx.validator_address">
          {{ moniker(tx.validator_address) }}
        </router-link>
      </div>
      <div slot="fees">
        Fee:  <b>{{ fees ? full(atoms(fees.amount)) : full(0) }}</b>
        <span>{{ fees ? fees.denom : bondingDenom }}s</span>
      </div>
    </template>
    <template v-else-if="txType === `cosmos-sdk/MsgSetWithdrawAddress`">
      <div slot="caption">
        Update withdraw address
      </div>
      <div slot="details">
        To {{ tx.withdraw_address }}
      </div>
      <div slot="fees">
        Fee:  <b>{{ fees ? full(atoms(fees.amount)) : full(0) }}</b>
        <span>{{ fees ? fees.denom : bondingDenom }}s</span>
      </div>
    </template>
    <template
      v-else-if="txType === `cosmos-sdk/MsgWithdrawValidatorCommission`"
    >
      <div slot="caption">
        Withdraw validator commission
      </div>
      <div slot="details">
        From<router-link :to="url + '/' + tx.validator_address">
          {{ moniker(tx.validator_address) }}
        </router-link>
      </div>
      <div slot="fees">
        Fee:  <b>{{ fees ? full(atoms(fees.amount)) : full(0) }}</b>
        <span>{{ fees ? fees.denom : bondingDenom }}s</span>
      </div>
    </template>
  </li-transaction>
</template>

<script>
import LiTransaction from "./LiTransaction"
import { pretty, atoms, full } from "../../scripts/num.js"

export default {
  name: `li-distribution-transaction`,
  components: { LiTransaction },
  props: {
    transaction: {
      type: Object,
      required: true
    },
    fees: {
      type: Object,
      default: null
    },
    url: {
      type: String,
      required: true
    },
    bondingDenom: {
      type: String,
      required: true
    },
    txType: {
      type: String,
      required: true
    },
    validators: {
      type: Array,
      required: true
    }
  },
  data: () => ({
    atoms,
    full,
    pretty
  }),
  computed: {
    tx() {
      return this.transaction.tx.value.msg[0].value
    }
  },
  methods: {
    moniker(validatorAddr) {
      const validator = this.validators.find(
        c => c.operator_address === validatorAddr
      )
      return validator ? validator.description.moniker : validatorAddr
    }
  }
}
</script>
