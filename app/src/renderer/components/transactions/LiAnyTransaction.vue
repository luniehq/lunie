<template>
  <li-bank-transaction
    v-if="bankTx"
    :transaction="transaction"
    :bonding-denom="bondingDenom"
    :address="address"
    :fees="fees"
  />
  <li-stake-transaction
    v-else-if="stakingTx"
    :transaction="transaction"
    :validators="validators"
    :url="validatorsUrl"
    :unbonding-time="unbondingTime"
    :bonding-denom="bondingDenom"
    :tx-type="type"
    :fees="fees"
  />
  <li-gov-transaction
    v-else-if="governanceTx"
    :transaction="transaction"
    :bonding-denom="bondingDenom"
    :url="proposalsUrl"
    :tx-type="type"
    :fees="fees"
  />
  <li-distribution-transaction
    v-else-if="distributionTx"
    :transaction="transaction"
    :url="validatorsUrl"
    :bonding-denom="bondingDenom"
    :tx-type="type"
    :validators="validators"
    :fees="fees"
  />
  <li-transaction
    v-else
    :time="transaction.time"
    :block="transaction.height"
    color="grey"
  >
    <span slot="caption">Unknown Transaction Type</span>
  </li-transaction>
</template>

<script>
import { coinsToObject } from "scripts/common"
import LiBankTransaction from "./LiBankTransaction"
import LiStakeTransaction from "./LiStakeTransaction"
import LiGovTransaction from "./LiGovTransaction"
import LiDistributionTransaction from "./LiDistributionTransaction"
import LiTransaction from "./LiTransaction"

export default {
  name: `li-any-transaction`,
  components: {
    LiBankTransaction,
    LiGovTransaction,
    LiStakeTransaction,
    LiDistributionTransaction,
    LiTransaction
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
  data: () => ({
    coinsToObject
  }),
  computed: {
    type() {
      return this.transaction.tx.value.msg[0].type
    },
    fees() {
      return (
        this.transaction.tx.value.fee.amount &&
        this.transaction.tx.value.fee.amount[0]
      )
    },
    bankTx() {
      return [`cosmos-sdk/MsgSend`].includes(this.type)
    },
    stakingTx() {
      return [
        `cosmos-sdk/MsgCreateValidator`,
        `cosmos-sdk/MsgEditValidator`,
        `cosmos-sdk/MsgDelegate`,
        `cosmos-sdk/MsgUndelegate`,
        `cosmos-sdk/MsgBeginRedelegate`,
        `cosmos-sdk/MsgUnjail`
      ].includes(this.type)
    },
    governanceTx() {
      return [
        `cosmos-sdk/MsgSubmitProposal`,
        `cosmos-sdk/MsgDeposit`,
        `cosmos-sdk/MsgVote`
      ].includes(this.type)
    },
    distributionTx() {
      return [
        `cosmos-sdk/MsgSetWithdrawAddress`,
        `cosmos-sdk/MsgWithdrawDelegationReward`,
        `cosmos-sdk/MsgWithdrawValidatorCommission`
      ].includes(this.type)
    }
  }
}
</script>
