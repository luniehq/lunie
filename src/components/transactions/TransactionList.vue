<template>
  <div>
    <div v-for="msg in transactions" :key="msg.key">
      <LiBankTransaction
        v-if="isBankTx(msg.type)"
        :tx="msg.value"
        :bonding-denom="bondingDenom"
        :address="address"
        :fees="msg.fees"
        :time="msg.time"
        :block="Number(msg.blockNumber)"
        :memo="msg.memo"
        :hide-meta-data="false"
      />
      <LiStakeTransaction
        v-else-if="isStakingTx(msg.type)"
        :tx="msg.value"
        :validators="validators"
        :url="validatorsUrl"
        :unbonding-time="getUnbondTimeFromTX(msg, unbondingDelegations)"
        :bonding-denom="bondingDenom"
        :tx-type="msg.type"
        :fees="msg.fees"
        :time="msg.time"
        :block="Number(msg.blockNumber)"
        :memo="msg.memo"
        :hide-meta-data="false"
      />
      <LiGovTransaction
        v-else-if="isGovernanceTx(msg.type)"
        :tx="msg.value"
        :bonding-denom="bondingDenom"
        :url="proposalsUrl"
        :tx-type="msg.type"
        :fees="msg.fees"
        :time="msg.time"
        :block="Number(msg.blockNumber)"
        :memo="msg.memo"
        :hide-meta-data="false"
      />
      <LiDistributionTransaction
        v-else-if="isDistributionTx(msg.type)"
        :tx="msg.value"
        :url="validatorsUrl"
        :bonding-denom="bondingDenom"
        :tx-type="msg.type"
        :validators="validators"
        :fees="msg.fees"
        :time="msg.time"
        :block="Number(msg.blockNumber)"
        :memo="msg.memo"
        :hide-meta-data="false"
      />
      <LiTransaction
        v-else
        :time="msg.time"
        :block="Number(msg.blockNumber)"
        color="grey"
        :hide-meta-data="false"
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
import { getUnbondTimeFromTX } from "scripts/time"

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
      type: Array,
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
