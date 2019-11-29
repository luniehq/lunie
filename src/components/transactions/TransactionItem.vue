<template>
  <div class="tx-container">
    <div class="tx" @click="toggleDetail">
      <div class="toggle-box">
        <i v-if="!show" class="material-icons toggle-icon"
          >keyboard_arrow_down</i
        >
        <i v-else class="material-icons toggle-icon">keyboard_arrow_up</i>
      </div>
      <component
        :is="messageTypeComponent"
        :transaction="transaction"
        :validators="validators"
        :session-address="address"
        class="tx-caption"
      />
    </div>
    <transition name="slide-out">
      <div v-if="show" class="tx-details">
        <TransactionMetadata v-if="showMetaData" :transaction="transaction" />
      </div>
    </transition>
  </div>
</template>

<script>
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
        /* istanbul ignore next */
        default:
          return ``
      }
    }
  },
  methods: {
    toggleDetail(event) {
      if (event.target.className !== `address`) {
        this.show = !this.show
      }
    }
  }
}
</script>

<style>
.tx {
  position: relative;
}

.tx-container {
  margin-bottom: 0.5rem;
}

.tx-details {
  padding: 0 1rem;
}

.tx-caption {
  cursor: pointer;
}

.tx-caption b {
  font-weight: 500;
}

.tx-details {
  background: var(--app-fg);
  border-left: 1px solid var(--bc-dim);
  border-right: 1px solid var(--bc-dim);
  border-bottom: 1px solid var(--bc-dim);
  border-bottom-left-radius: 0.25rem;
  border-bottom-right-radius: 0.25rem;
  margin: 0 1rem 0.5rem 1rem;
  padding: 1rem;
  font-size: 14px;
  position: relative;
  z-index: 0;
}

.tx__content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  background: var(--app-fg);
  position: relative;
  z-index: 90;
  border: 1px solid var(--bc-dim);
  border-radius: 0.25rem;
}

.tx__content__caption {
  display: flex;
  width: 100%;
}

.tx__content__left,
.tx__content__right {
  display: flex;
  width: 100%;
  padding: 1rem;
}

.tx__content__right {
  right: 1rem;
}

.tx__content__information {
  font-size: 14px;
  right: 1.5rem;
}

.tx__content__information,
.tx__content__information > * {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
}

.tx__content__caption {
  line-height: 18px;
  font-size: 18px;
  color: var(--bright);
  padding: 1rem 1rem 1rem 0;
}

.slide-out-enter-active,
.slide-out-leave-active {
  transition: all 0.4s;
}

.slide-out-enter,
.slide-out-leave-to {
  opacity: 0;
  transform: translateY(-100px);
  margin-bottom: -100px;
}

.tx__icon img {
  max-height: 100%;
  max-width: 52px;
  display: block;
}

.amount {
  display: block;
  width: 100%;
  text-align: right;
}

.toggle-icon {
  width: 20px;
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  z-index: 91;
}

.toggle-box i {
  font-size: 1rem;
  padding: 0.1rem;
  border-radius: 50%;
  background: var(--bc-dim);
  height: 1.2rem;
  width: 1.2rem;
}

.validator-image {
  border-radius: 0.25rem;
  height: 1.2rem;
  width: 1.2rem;
  border: 1px solid var(--bc-dim);
  vertical-align: middle;
  margin-bottom: 2px;
}
</style>
