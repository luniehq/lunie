<template>
  <LiTransaction
    :color="`#F2B134`"
    :time="time"
    :block="block"
    :memo="memo"
    :fees="fees"
  >
    <template v-if="txType === MsgWithdrawDelegationReward">
      <div slot="caption">
        Withdrawal
      </div>
      <div slot="details">
        From&nbsp;<router-link :to="`${url}/${tx.validator_address}`">
          {{ moniker(tx.validator_address) }}
        </router-link>
      </div>
    </template>
    <template v-else-if="txType === MsgSetWithdrawAddress">
      <div slot="caption">
        Update withdraw address
      </div>
      <div slot="details">To {{ tx.withdraw_address }}</div>
    </template>
    <template v-else-if="txType === MsgWithdrawValidatorCommission">
      <div slot="caption">
        Withdraw validator commission
      </div>
      <div slot="details">
        From<router-link :to="`${url}/${tx.validator_address}`">
          {{ moniker(tx.validator_address) }}
        </router-link>
      </div>
    </template>
  </LiTransaction>
</template>

<script>
import LiTransaction from "./LiTransaction"
import num from "../../scripts/num.js"

export default {
  name: `li-distribution-transaction`,
  components: { LiTransaction },
  props: {
    tx: {
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
    },
    time: {
      type: String,
      default: null
    },
    block: {
      type: Number,
      required: true
    },
    memo: {
      type: String,
      default: null
    }
  },
  data: () => ({
    num,
    MsgWithdrawValidatorCommission: `cosmos-sdk/MsgWithdrawValidatorCommission`,
    MsgSetWithdrawAddress: `cosmos-sdk/MsgSetWithdrawAddress`,
    MsgWithdrawDelegationReward: `cosmos-sdk/MsgWithdrawDelegationReward`
  }),
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
