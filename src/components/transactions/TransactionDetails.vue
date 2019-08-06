<template>
  <div class="tx__content">
    <component
      :is="messageTypeComponent"
      :transaction="transaction"
      :validators="validators"
      :session-address="address"
      class="tx__content__left"
    />
    <TransactionMetadata
      v-if="showMetaData"
      :fees="transaction.fees"
      :block="transaction.blockNumber"
      :time="transaction.time"
      class="tx__content__right"
    />
  </div>
</template>

<script>
import { messageType } from "./messageTypes.js"
import TransactionMetadata from "./TransactionMetadata"

import {
  SendMessageDetails,
  DelegateMessageDetails,
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
} from "./message-view"

import Bech32 from "common/Bech32"

export default {
  name: `transaction-details`,
  components: {
    TransactionMetadata,
    Bech32,
    SendMessageDetails,
    DelegateMessageDetails,
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
    },
    address: {
      type: String,
      required: false,
      default: ""
    },
    showMetaData: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    messageTypeComponent: function() {
      // TODO Could improve this using dynamic loading.
      switch (this.transaction.type) {
        case messageType.SEND:
          return `send-message-details`
        case messageType.DELEGATE:
          return `delegate-message-details`
        case messageType.CREATE_VALIDATOR:
          return `create-validator-message-details`
        case messageType.EDIT_VALIDATOR:
          return `edit-validator-message-details`
        case messageType.UNDELEGATE:
          return `undelegate-message-details`
        case messageType.BEGIN_REDELEGATE:
          return `begin-redelegate-message-details`
        case messageType.UNJAIL:
          return `unjail-message-details`
        case messageType.SUBMIT_PROPOSAL:
          return `submit-proposal-message-details`
        case messageType.DEPOSIT:
          return `deposit-message-details`
        case messageType.VOTE:
          return `vote-message-details`
        case messageType.SET_WITHDRAW_ADDRESS:
          return `set-withdraw-address-message-details`
        case messageType.WITHDRAW_DELEGATION_REWARD:
          return `withdraw-delegation-reward-message-details`
        case messageType.WITHDRAW_VALIDATOR_COMMISSION:
          return `withdraw-validator-commission-message-details`
        default:
          return ``
      }
    }
  }
}
</script>

<style scoped>
.tx__content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 1rem;
}

.tx__content__left,
.tx__content__right {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.tx__content__right {
  text-align: right;
}

.tx__content__information,
.tx__content__information > * {
  display: flex;
  flex-direction: row;
}

.tx__content__information,
.tx__content__right {
  font-size: 14px;
  color: var(--dim);
}

.tx__content__caption {
  line-height: 18px;
  font-size: 18px;
  color: var(--bright);
}

@media screen and (max-width: 767px) {
  .tx__content {
    flex-direction: column;
    text-align: left;
  }

  .tx__content__right {
    text-align: left;
    padding-top: 0.5rem;
  }
}
</style>
