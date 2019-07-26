<template>
  <div class="li-tx__content">
    <component :is="msgTypeComponent" :transaction="transaction" :coin="coin"></component>
  </div>
</template>

<script>
import msgType from "./messageTypes.js"
import SendMessageDetails from "./message-view/SendMessage"
import Bech32 from "common/Bech32"

export default {
  name: `transaction-details`,
  components: {
    Bech32,
    SendMessageDetails
  },
  props: {
    transaction: {
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
      switch (this.transactionType) {
        case msgType.SEND:
          return `send-message-details`
        case msgType.CREATE_VALIDATOR:
        case msgType.EDIT_VALIDATOR:
        case msgType.DELEGATE:
        case msgType.UNDELEGATE:
        case msgType.BEGIN_REDELEGATE:
        case msgType.UNJAIL:
        case msgType.SUBMIT_PROPOSAL:
        case msgType.DEPOSIT:
        case msgType.VOTE:
        case msgType.SET_WITHDRAW_ADDRESS:
        case msgType.WITHDRAW_DELEGATION_REWARD:
        case msgType.WITHDRAW_VALIDATOR_COMMISSION:
        default:
          return `send-message-details`
      }
    }
  }
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
