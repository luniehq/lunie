<template>
  <div class="li-tx__icon">
    <img :class="group" src="~assets/images/cosmos-logo.png" />
  </div>
</template>

<script>
import msgType from "./messageTypes.js"

export default {
  name: `transaction-icon`,
  props: {
    transactionType: {
      type: String,
      required: true
    }
  },
  computed: {
    group() {
      switch (this.transactionType) {
        case msgType.SEND:
          return `banking`
        case msgType.CREATE_VALIDATOR:
        case msgType.EDIT_VALIDATOR:
        case msgType.DELEGATE:
        case msgType.UNDELEGATE:
        case msgType.BEGIN_REDELEGATE:
        case msgType.UNJAIL:
          return `staking`
        case msgType.SUBMIT_PROPOSAL:
        case msgType.DEPOSIT:
        case msgType.VOTE:
          return `governance`
        case msgType.SET_WITHDRAW_ADDRESS:
        case msgType.WITHDRAW_DELEGATION_REWARD:
        case msgType.WITHDRAW_VALIDATOR_COMMISSION:
          return `distribution`
        default:
          return ``
      }
    }
  }
}
</script>

<style>
.li-tx__icon {
  padding: 12px 0 12px 1rem;
}

.li-tx__icon img {
  max-height: 100%;
  max-width: 52px;
  border: 2px solid;
  border-radius: 50%;
  display: block;
  border-color: grey;
}

.li-tx__icon img.banking {
  border-color: #ed553b;
}

.li-tx__icon img.staking {
  border-color: #47ab6c;
}

.li-tx__icon img.governance {
  border-color: #15cfcc;
}

.li-tx__icon img.distribution {
  border-color: #f2b134;
}
</style>
