<template>
  <div>
    <TransactionItem
      v-for="msg in transactions"
      :key="msg.key"
      :transaction="msg"
      :validators="validators"
      :address="address"
    />
  </div>
</template>

<script>
// import TransactionItem from "./TransactionItem"
import TransactionItem from "./TransactionItem"
import { getUnbondTimeFromTX } from "scripts/time"

export default {
  name: `transaction-list`,
  components: {
    TransactionItem
  },
  props: {
    validatorsUrl: {
      type: String,
      default: null
    },
    proposalsUrl: {
      type: String,
      default: null
    },
    transactions: {
      type: Array,
      required: true
    },
    address: {
      type: String,
      default: null
    },
    bondingDenom: {
      type: String,
      required: true
    },
    validators: {
      type: Object,
      required: true
    },
    unbondingDelegations: {
      type: Object,
      required: true
    }
  },
  methods: {
    getUnbondTimeFromTX,
    isBankTx(type) {
      return [`cosmos-sdk/MsgSend`].includes(type)
    },
    isStakingTx(type) {
      return [
        `cosmos-sdk/MsgCreateValidator`,
        `cosmos-sdk/MsgEditValidator`,
        `cosmos-sdk/MsgDelegate`,
        `cosmos-sdk/MsgUndelegate`,
        `cosmos-sdk/MsgBeginRedelegate`,
        `cosmos-sdk/MsgUnjail`
      ].includes(type)
    },
    isGovernanceTx(type) {
      return [
        `cosmos-sdk/MsgSubmitProposal`,
        `cosmos-sdk/MsgDeposit`,
        `cosmos-sdk/MsgVote`
      ].includes(type)
    },
    isDistributionTx(type) {
      return [
        `cosmos-sdk/MsgSetWithdrawAddress`,
        `cosmos-sdk/MsgWithdrawDelegationReward`,
        `cosmos-sdk/MsgWithdrawValidatorCommission`
      ].includes(type)
    }
  }
}
</script>
