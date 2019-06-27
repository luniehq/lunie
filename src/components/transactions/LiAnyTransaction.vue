<template>
  <div>
    <div v-for="(msg, index) in transaction.tx.value.msg" :key="index">
      <LiBankTransaction
        v-if="bankTx(msg.type)"
        :tx="msg.value"
        :bonding-denom="bondingDenom"
        :address="address"
        :fees="fees"
        :time="transaction.time"
        :block="Number(transaction.height)"
        :memo="transaction.tx.value.memo"
        :hide-meta-data="hideMetaData"
      />
      <LiStakeTransaction
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
        :memo="transaction.tx.value.memo"
        :hide-meta-data="hideMetaData"
      />
      <LiGovTransaction
        v-else-if="governanceTx(msg.type)"
        :tx="msg.value"
        :bonding-denom="bondingDenom"
        :url="proposalsUrl"
        :tx-type="msg.type"
        :fees="fees"
        :time="transaction.time"
        :block="Number(transaction.height)"
        :memo="transaction.tx.value.memo"
        :hide-meta-data="hideMetaData"
      />
      <LiDistributionTransaction
        v-else-if="distributionTx(msg.type)"
        :tx="msg.value"
        :url="validatorsUrl"
        :bonding-denom="bondingDenom"
        :tx-type="msg.type"
        :validators="validators"
        :fees="fees"
        :time="transaction.time"
        :block="Number(transaction.height)"
        :memo="transaction.tx.value.memo"
        :hide-meta-data="hideMetaData"
      />
      <LiTransaction
        v-else
        :time="transaction.time"
        :block="Number(transaction.height)"
        color="grey"
        :hide-meta-data="hideMetaData"
      >
        <span slot="caption">Unknown Transaction Type</span>
      </LiTransaction>
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
    },
    hideMetaData: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    fees() {
      if (
        this.transaction.tx.value.fee &&
        this.transaction.tx.value.fee.amount
      ) {
        return this.transaction.tx.value.fee.amount[0]
      }
      return {
        amount: "0",
        denom: this.bondingDenom
      }
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
