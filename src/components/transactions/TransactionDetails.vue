<template>
  <div class="li-tx__content">
    <component
      :is="msgTypeComponent"
      :transaction="transaction"
      :coin="coin"
      :validators="validators"
      class="li-tx__content__left"
    />
    <TransactionFees
      :fees="transaction.fees"
      :block="transaction.blockNumber"
      :time="transaction.time"
      class="li-tx__content__right"
    />
  </div>
</template>

<script>
import msgType from "./messageTypes.js"
import TransactionFees from "./TransactionFees"

import DefaultMessageDetails from "./message-view/DefaultMessageDetails"
import SendMessageDetails from "./message-view/SendMessageDetails"
import DelegateMessageDetails from "./message-view/DelegateMessageDetails"
import DepositMessageDetails from "./message-view/DepositMessageDetails"
import EditValidatorMessageDetails from "./message-view/EditValidatorMessageDetails"
import SubmitProposalMessageDetails from "./message-view/SubmitProposalMessageDetails"
import UndelegateMessageDetails from "./message-view/UndelegateMessageDetails"
import UnjailMessageDetails from "./message-view/UnjailMessageDetails"
import CreateValidatorMessageDetails from "./message-view/CreateValidatorMessageDetails"
import VoteMessageDetails from "./message-view/VoteMessageDetails"
import BeginRedelegateMessageDetails from "./message-view/BeginRedelegateMessageDetails"
import SetWithdrawAddressMessageDetails from "./message-view/SetWithdrawAddressMessageDetails"
import WithdrawDelegationRewardMessageDetails from "./message-view/WithdrawDelegationRewardMessageDetails"
import WithdrawValidatorCommissionMessageDetails from "./message-view/WithdrawValidatorCommissionMessageDetails"

import Bech32 from "common/Bech32"

export default {
  name: `transaction-details`,
  components: {
    TransactionFees,
    Bech32,
    SendMessageDetails,
    DelegateMessageDetails,
    DefaultMessageDetails,
    DepositMessageDetails,
    EditValidatorMessageDetails,
    SubmitProposalMessageDetails,
    UndelegateMessageDetails,
    UnjailMessageDetails,
    CreateValidatorMessageDetails,
    VoteMessageDetails,
    BeginRedelegateMessageDetails,
    SetWithdrawAddressMessageDetails,
    WithdrawDelegationRewardMessageDetails,
    WithdrawValidatorCommissionMessageDetails
  },
  props: {
    transaction: {
      type: Object,
      required: true
    },
    validators: {
      type: Object,
      required: true
    }
  },
  computed: {
    coin() {
      if (Array.isArray(this.transaction.value.amount)) {
        return this.transaction.value.amount[0]
      } else {
        return this.transaction.value.amount
      }
    },
    msgTypeComponent: function() {
      // TODO This could be better
      switch (this.transaction.type) {
        case msgType.SEND:
          return `send-message-details`
        case msgType.DELEGATE:
          return `delegate-message-details`
        case msgType.CREATE_VALIDATOR:
          return `create-validator-message-details`
        case msgType.EDIT_VALIDATOR:
          return `edit-validator-message-details`
        case msgType.UNDELEGATE:
          return `undelegate-message-details`
        case msgType.BEGIN_REDELEGATE:
          return `begin-redelegate-message-details`
        case msgType.UNJAIL:
          return `unjail-message-details`
        case msgType.SUBMIT_PROPOSAL:
          return `submit-proposal-message-details`
        case msgType.DEPOSIT:
          return `deposit-message-details`
        case msgType.VOTE:
          return `vote-message-details`
        case msgType.SET_WITHDRAW_ADDRESS:
          return `set-withdraw-address-message-details`
        case msgType.WITHDRAW_DELEGATION_REWARD:
          return `withdraw-delegation-reward-message-details`
        case msgType.WITHDRAW_VALIDATOR_COMMISSION:
          return `withdraw-validator-commission-message-details`
        default:
          return `default-message-details`
      }
    }
  },

}
</script>

<style>
.li-tx {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  border: 1px solid var(--bc-dim);
  background: var(--app-fg);
  width: 100%;
  font-weight: 300;
  position: relative;
}

.li-tx .copied {
  position: absolute;
  bottom: 0;
}

.li-tx b {
  font-weight: 500;
}

.li-tx__icon {
  padding: 12px 0 12px 1rem;
}

.li-tx__icon img {
  max-height: 100%;
  max-width: 52px;
  border: 2px solid;
  border-radius: 50%;
  display: block;
}

.li-tx__content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 1rem;
}

.li-tx__content__left,
.li-tx__content__right {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.li-tx__content__right {
  text-align: right;
}

.li-tx__content__information,
.li-tx__content__information > * {
  display: flex;
  flex-direction: row;
}

.li-tx__content__information,
.li-tx__content__right {
  font-size: 14px;
  color: var(--dim);
}

.li-tx__content__caption {
  line-height: 18px;
  font-size: 18px;
  color: var(--bright);
}

@media screen and (max-width: 767px) {
  .li-tx__content {
    flex-direction: column;
    text-align: left;
  }

  .li-tx__content__right {
    text-align: left;
    padding-top: 0.5rem;
  }
}
</style>
