<template lang="pug">
tm-li-bank-transaction(v-if="bankTx" :transaction="transaction" :address="address")
tm-li-stake-transaction(v-else-if="stakingTx" :transaction="transaction" :validators="validators" :URL="validatorsURL" :unbonding_time="unbonding_time" :bondingDenom="bondingDenom" v-on:end-unbonding="$emit('end-unbonding')")
tm-li-gov-transaction(v-else-if="governanceTx" :transaction="transaction" :bondingDenom="bondingDenom" :URL="proposalsURL")
tm-li-transaction(v-else :color="colors.grey" :time="transaction.time" :block="transaction.height")
  span(slot="caption") Unknown Transaction Type
</template>

<script>
import TmLiBankTransaction from "../TmLiBankTransaction/TmLiBankTransaction"
import TmLiStakeTransaction from "../TmLiStakeTransaction/TmLiStakeTransaction"
import TmLiGovTransaction from "../TmLiGovTransaction"
import TmLiTransaction from "../TmLiTransaction/TmLiTransaction"
import colors from "../TmLiTransaction/transaction-colors.js"

export default {
  name: "tm-li-any-transaction",
  components: {
    TmLiBankTransaction,
    TmLiGovTransaction,
    TmLiStakeTransaction,
    TmLiTransaction
  },
  data: () => ({ colors }),
  computed: {
    type() {
      return this.transaction.tx.value.msg[0].type
    },
    bankTx() {
      return ["cosmos-sdk/Send"].includes(this.type)
    },
    stakingTx() {
      return [
        "cosmos-sdk/MsgDelegate",
        "cosmos-sdk/BeginUnbonding",
        "cosmos-sdk/CompleteUnbonding",
        "cosmos-sdk/BeginRedelegate"
      ].includes(this.type)
    },
    governanceTx() {
      return [`cosmos-sdk/MsgSubmitProposal`, `cosmos-sdk/MsgDeposit`].includes(
        this.type
      )
    }
  },
  props: {
    transaction: Object,
    address: String,
    validators: Array,
    validatorsURL: {
      type: String,
      default: ""
    },
    proposalsURL: {
      type: String,
      default: ""
    },
    bondingDenom: {
      type: String,
      default: "atom"
    },
    unbonding_time: String
  }
}
</script>

<style lang="stylus"></style>
