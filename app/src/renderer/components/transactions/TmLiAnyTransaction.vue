s<template>
  <tm-li-bank-transaction
    v-if="bankTx"
    :transaction="transaction"
    :address="address"
  ></tm-li-bank-transaction>
  <tm-li-stake-transaction
    v-else-if="stakingTx"
    :transaction="transaction"
    :validators="validators"
    :url="validatorsURL"
    :unbonding_time="unbonding_time"
    :bonding-denom="bondingDenom"
    @end-unbonding="$emit('end-unbonding')"
  ></tm-li-stake-transaction>
  <tm-li-gov-transaction
    v-else-if="governanceTx"
    :transaction="transaction"
    :bonding-denom="bondingDenom"
    :url="proposalsURL"
  ></tm-li-gov-transaction>
  <tm-li-transaction
    v-else
    :color="colors.grey"
    :time="transaction.time"
    :block="transaction.height"
    ><span slot="caption">Unknown Transaction Type</span></tm-li-transaction
  >
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
    transaction: Object,
    address: String,
    validators: Array,
    validatorsURL: {
      type: String,
      default: ``
    },
    proposalsURL: {
      type: String,
      default: ``
    },
    bondingDenom: {
      type: String,
      default: `atom`
    },
    unbonding_time: String
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

<style></style>
