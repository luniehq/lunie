<template>
  <div>
    <div class="tx" :class="{ show }" @click="toggleDetail()">
      <TransactionIcon :transaction-group="transaction.group"></TransactionIcon>
      <component
        :is="messageTypeComponent"
        show="caption"
        :transaction="transaction"
        :validators="validators"
        :session-address="address"
        class="tx__content"
      />
    </div>
    <div v-if="show" class="tx-details">
      <component
        :is="messageTypeComponent"
        show="details"
        :transaction="transaction"
        :validators="validators"
        :session-address="address"
        class="tx__content"
      />
      <TransactionMetadata
        v-if="showMetaData"
        :fee="transaction.fee"
        :height="transaction.height"
        :timestamp="new Date(transaction.timestamp)"
      />
    </div>
  </div>
</template>

<script>
import TransactionIcon from "./TransactionIcon"
import { messageType } from "./messageTypes.js"
import TransactionMetadata from "./TransactionMetadata"
import Bech32 from "common/Bech32"

import {
  SendMessageDetails,
  MultiSendMessageDetails,
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

export default {
  name: `tx-item`,
  components: {
    TransactionIcon,
    TransactionMetadata,
    Bech32,
    SendMessageDetails,
    MultiSendMessageDetails,
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
      default: null
    },
    showMetaData: {
      type: Boolean,
      default: true
    }
  },
  data: () => ({
    show: false
  }),
  computed: {
    messageTypeComponent: function() {
      // TODO Could improve this using dynamic loading.
      switch (this.transaction.type) {
        case messageType.SEND:
          return `send-message-details`
        case messageType.MULTISEND:
          return `multi-send-message-details`
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
  },
  methods: {
    toggleDetail() {
      this.show = !this.show
    }
  }
}
</script>

<style>
.tx {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  border: 1px solid var(--bc-dim);
  border-radius: 5px;
  background: var(--app-fg);
  width: 100%;
  position: relative;
  cursor: pointer;
}

.tx:hover {
  cursor: pointer;
  background: var(--hover-bg);
  color: var(--bright);
}

.tx.show {
  margin-bottom: 0;
}

.tx .copied {
  position: absolute;
  bottom: 0;
}

.tx b {
  font-weight: 500;
}

.tx-details {
  background: #272f58;
  margin: 0 1rem 0.5rem 1rem;
  padding: 1rem;
  font-size: 14px;
}

.tx__content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.tx__content__caption {
  display: flex;
  width: 100%;
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

.tx__content__information {
  font-size: 14px;
}

.tx__content__caption {
  line-height: 18px;
  font-size: 18px;
  color: var(--bright);
}

.tx__content__caption {
  line-height: 18px;
  font-size: 18px;
  color: var(--bright);
  padding: 1rem 1rem 1rem 0;
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
