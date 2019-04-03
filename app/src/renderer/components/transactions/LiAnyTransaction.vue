<template>
  <div>
    <div
      v-for="(msg, index) in transaction.tx.value.msg"
      :key="index"
    >
      <li-bank-transaction
        v-if="bankTx(msg.type)"
        :tx="msg.value"
        :bonding-denom="bondingDenom"
        :address="address"
        :fees="fees"
        :time="transaction.time"
        :block="Number(transaction.height)"
      />
      <li-stake-transaction
        v-else-if="stakingTx(msg.type)"
        :tx="msg.value"
        :validators="validators"
        :url="validatorsUrl"
        :unbonding-time="unbondingTime"
        :bonding-denom="bondingDenom"
        :tx-type="msg.type"
        :fees="fees"
        :time="transaction.time"
        :block="Number(transaction.height)"
      />
      <li-gov-transaction
        v-else-if="governanceTx(msg.type)"
        :tx="msg.value"
        :bonding-denom="bondingDenom"
        :url="proposalsUrl"
        :tx-type="msg.type"
        :fees="fees"
        :time="transaction.time"
        :block="Number(transaction.height)"
      />
      <li-distribution-transaction
        v-else-if="distributionTx(msg.type)"
        :tx="msg.value"
        :url="validatorsUrl"
        :bonding-denom="bondingDenom"
        :tx-type="msg.type"
        :validators="validators"
        :fees="fees"
        :time="transaction.time"
        :block="Number(transaction.height)"
      />
      <li-transaction
        v-else
        :time="transaction.time"
        :block="Number(transaction.height)"
        color="grey"
      >
        <span slot="caption">Unknown Transaction Type</span>
      </li-transaction>
    </div>
  </div>
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
    fees() {
      return (
        this.transaction.tx.value.fee.amount &&
        this.transaction.tx.value.fee.amount[0]
      )
    }
  },
  methods: {
    bankTx(type) {
      return [`cosmos-sdk/MsgSend`].includes(type)
    },
    stakingTx(type) {
      return [
        `cosmos-sdk/MsgCreateValidator`,
        `cosmos-sdk/MsgEditValidator`,
        `cosmos-sdk/MsgDelegate`,
        `cosmos-sdk/MsgUndelegate`,
        `cosmos-sdk/MsgBeginRedelegate`,
        `cosmos-sdk/MsgUnjail`
      ].includes(type)
    },
    governanceTx(type) {
      return [
        `cosmos-sdk/MsgSubmitProposal`,
        `cosmos-sdk/MsgDeposit`,
        `cosmos-sdk/MsgVote`
      ].includes(type)
    },
    distributionTx(type) {
      return [
        `cosmos-sdk/MsgSetWithdrawAddress`,
        `cosmos-sdk/MsgWithdrawDelegationReward`,
        `cosmos-sdk/MsgWithdrawValidatorCommission`
      ].includes(type)
    }
  }
}
</script>
