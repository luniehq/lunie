<template>
  <div class="tx-container">
    <div class="tx" @click="toggleDetail">
      <component
        :is="messageTypeComponent"
        :transaction="transaction"
        :validators="validators"
        :session-address="address"
      />
      <div class="toggle" :class="{ up: show }">
        <i class="material-icons toggle-icon">keyboard_arrow_down</i>
      </div>
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
  WithdrawDelegationRewardMessageDetails
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
    WithdrawDelegationRewardMessageDetails
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
  font-size: 14px;
  display: flex;
  align-items: center;
  background: var(--app-fg);
  border: 1px solid var(--bc-dim);
  border-radius: 0.25rem;
  z-index: 90;
  cursor: pointer;
}

.tx a {
  display: inline-block;
}

.tx h3 {
  font-size: 18px;
  font-weight: 400;
  padding-bottom: 2px;
  color: var(--bright);
}

.tx .amount {
  white-space: nowrap;
}

.tx-container {
  margin: 0 1rem 0.5rem;
}

.tx-details {
  padding: 0 1rem;
}

.tx-details {
  background: var(--app-fg);
  border-left: 1px solid var(--bc-dim);
  border-right: 1px solid var(--bc-dim);
  border-bottom: 1px solid var(--bc-dim);
  border-bottom-left-radius: 0.25rem;
  border-bottom-right-radius: 0.25rem;
  margin: 0 1rem 0.5rem 1rem;
  font-size: 14px;
  padding: 1rem;
  position: relative;
  z-index: 0;
}

.tx__content {
  display: flex;
  align-items: center;
  position: relative;
  z-index: 90;
  width: 100%;
}

.tx__content__left {
  padding: 1rem 1rem 1rem 0;
}

.tx__content__right {
  padding-right: 2rem;
  text-align: right;
  flex: auto;
}

.slide-out-enter-active,
.slide-out-leave-active {
  transition: all 0.2s;
}

.slide-out-enter,
.slide-out-leave-to {
  opacity: 0;
  transform: translateY(-100px);
  margin-bottom: -100px;
}

.toggle {
  position: relative;
  right: 1rem;
  z-index: 91;
  cursor: pointer;
  padding: 0.1rem;
  border-radius: 50%;
  background: var(--bc-dim);
  height: 20px;
  width: 20px;
  transition: transform 0.2s ease;
}

.toggle.up {
  transform: rotate(180deg);
}

.toggle-icon {
  font-size: 16px;
}

.validator-image {
  border-radius: 0.25rem;
  height: 1rem;
  width: 1rem;
  vertical-align: middle;
  margin: 0 2px 2px 2px;
}

@media screen and (max-width: 767px) {
  .tx__icon {
    display: none;
  }

  .tx__content__left {
    padding-left: 1rem;
  }

  .toggle {
    display: none;
  }

  .amount {
    position: absolute;
    right: 1rem;
    top: 1.2rem;
  }
  /* .tx__content__left div,
  .tx__content__left i,
  .tx__content__left span,
  .tx__content__left a {
    display: none;
  } */
}
</style>
