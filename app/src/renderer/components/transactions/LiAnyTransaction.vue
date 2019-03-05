<template>
  <li-bank-transaction
    v-if="bankTx"
    :transaction="transaction"
    :address="address"
  />
  <li-stake-transaction
    v-else-if="stakingTx"
    :transaction="transaction"
    :validators="validators"
    :url="validatorsUrl"
    :unbonding-time="unbondingTime"
    :bonding-denom="bondingDenom"
    :tx-type="type"
  />
  <li-gov-transaction
    v-else-if="governanceTx"
    :transaction="transaction"
    :bonding-denom="bondingDenom"
    :url="proposalsUrl"
    :tx-type="type"
  />
  <li-distribution-transaction
    v-else-if="distributionTx"
    :transaction="transaction"
    :url="validatorsUrl"
    :bonding-denom="bondingDenom"
    :tx-type="type"
    :validators="validators"
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
  computed: {
    type() {
      return this.transaction.tx.value.msg[0].type
    },
    bankTx() {
      return [`cosmos-sdk/Send`].includes(this.type)
    },
    stakingTx() {
      return [
        `cosmos-sdk/MsgCreateValidator`,
        `cosmos-sdk/MsgEditValidator`,
        `cosmos-sdk/MsgDelegate`,
        `cosmos-sdk/Undelegate`,
        `cosmos-sdk/BeginRedelegate`,
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
