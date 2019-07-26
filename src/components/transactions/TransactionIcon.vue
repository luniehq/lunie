<template>
  <div class="li-tx__icon">
    <img :style="{ borderColor: colour }" src="~assets/images/cosmos-logo.png" />
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
    colour() {
      switch (this.transactionType) {
        case msgType.SEND:
          return `#ED553B`
        case msgType.CREATE_VALIDATOR:
        case msgType.EDIT_VALIDATOR:
        case msgType.DELEGATE:
        case msgType.UNDELEGATE:
        case msgType.BEGIN_REDELEGATE:
        case msgType.UNJAIL:
          return `#47AB6C`
        case msgType.SUBMIT_PROPOSAL:
        case msgType.DEPOSIT:
        case msgType.VOTE:
          return `#15CFCC`
        case msgType.SET_WITHDRAW_ADDRESS:
        case msgType.WITHDRAW_DELEGATION_REWARD:
        case msgType.WITHDRAW_VALIDATOR_COMMISSION:
          return `#F2B134`
        default:
          return `grey`
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
}
</style>
