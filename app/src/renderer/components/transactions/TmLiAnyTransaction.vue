<template>
  <tm-li-bank-transaction
    v-if="bankTx"
    :transaction="transaction"
    :address="address"
  />
  <tm-li-stake-transaction
    v-else-if="stakingTx"
    :transaction="transaction"
    :validators="validators"
    :url="validatorsUrl"
    :unbonding-time="unbondingTime"
    :bonding-denom="bondingDenom"
    @end-unbonding="$emit('end-unbonding')"
  />
  <tm-li-gov-transaction
    v-else-if="governanceTx"
    :transaction="transaction"
    :bonding-denom="bondingDenom"
    :url="proposalsUrl"
  />
  <tm-li-transaction
    v-else
    :color="colors.grey"
    :time="transaction.time"
    :block="transaction.height"
  >
    <span slot="caption">Unknown Transaction Type</span>
  </tm-li-transaction>
</template>

<script>
import TmLiBankTransaction from "./TmLiBankTransaction"
import TmLiStakeTransaction from "./TmLiStakeTransaction"
import TmLiGovTransaction from "./TmLiGovTransaction"
import TmLiTransaction from "./TmLiTransaction"
import colors from "./transaction-colors.js"

export default {
  name: `TmLiAnyTransaction`,
  components: {
    TmLiBankTransaction,
    TmLiGovTransaction,
    TmLiStakeTransaction,
    TmLiTransaction
  },
  props: {
    transaction: {
      type: Object,
      required: true
    },
    address: {
      type: String,
      default: null
    },
    validators: {
      type: Array,
      required: true
    },
    validatorsUrl: {
      type: String,
      default: null
    },
    proposalsUrl: {
      type: String,
      default: null
    },
    bondingDenom: {
      type: String,
      required: true
    },
    unbondingTime: {
      type: Number,
      default: null
    }
  },
  data: () => ({ colors }),
  computed: {
    type() {
      return this.transaction.tx.value.msg[0].type
    },
    bankTx() {
      return [`cosmos-sdk/Send`].includes(this.type)
    },
    stakingTx() {
      return [
        `cosmos-sdk/MsgDelegate`,
        `cosmos-sdk/BeginUnbonding`,
        `cosmos-sdk/CompleteUnbonding`,
        `cosmos-sdk/BeginRedelegate`
      ].includes(this.type)
    },
    governanceTx() {
      return [`cosmos-sdk/MsgSubmitProposal`, `cosmos-sdk/MsgDeposit`].includes(
        this.type
      )
    }
  }
}
</script>
