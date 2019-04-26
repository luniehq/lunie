<template>
  <li-transaction :color="`#F2B134`" :time="time" :block="block">
    <template v-if="txType === `cosmos-sdk/MsgWithdrawDelegationReward`">
      <div slot="caption">
        Withdrawal
      </div>
      <div slot="details">
        From&nbsp;<router-link :to="`${url}/${tx.validator_address}`">
          {{ moniker(tx.validator_address) }}
        </router-link>
      </div>
      <div slot="fees">
        Network Fee:&nbsp;<b>{{ convertedFees ? convertedFees.amount : 0 }}</b>
        <span>
          {{
            convertedFees ? convertedFees.denom : num.viewDenom(bondingDenom)
          }}
        </span>
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
        Network Fee:&nbsp;<b>{{ convertedFees ? convertedFees.amount : 0 }}</b>
        <span>
          {{
            convertedFees ? convertedFees.denom : num.viewDenom(bondingDenom)
          }}
        </span>
      </div>
    </template>
    <template
      v-else-if="txType === `cosmos-sdk/MsgWithdrawValidatorCommission`"
    >
      <div slot="caption">
        Withdraw validator commission
      </div>
      <div slot="details">
        From<router-link :to="`${url}/${tx.validator_address}`">
          {{ moniker(tx.validator_address) }}
        </router-link>
      </div>
      <div slot="fees">
        Network Fee:&nbsp;<b>{{ convertedFees ? convertedFees.amount : 0 }}</b>
        <span>
          {{
            convertedFees ? convertedFees.denom : num.viewDenom(bondingDenom)
          }}
        </span>
      </div>
    </template>
  </li-transaction>
</template>

<script>
import LiTransaction from "./LiTransaction"
import num, { pretty, atoms } from "../../scripts/num.js"

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
    }
  },
  data: () => ({
    atoms,
    pretty,
    num
  }),
  computed: {
    convertedFees() {
      return this.fees ? num.createCoinObject(this.fees) : undefined
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
