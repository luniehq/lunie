<template>
  <div>
    <div v-if="show === `caption`" class="tx__content__caption">
      <div class="tx__content__left">
        {{ caption }}
      </div>
      <div class="tx__content__right">
        {{ coin.amount | atoms | prettyLong }} {{ coin.denom | viewDenom }}
      </div>
    </div>
    <div v-if="show === `details`" class="tx__content__information">
      <template v-if="toYourself">
        To yourself!
      </template>
      <template v-else-if="sentFromSessionAddress">
        To&nbsp;
        <Bech32 :address="transaction.value.to_address" />
      </template>
      <template v-else-if="receivedToSessionAddress">
        From&nbsp;
        <Bech32 :address="transaction.value.inputs[0].address" />
      </template>
      <template v-else>
        From&nbsp;
        <Bech32 :address="transaction.value.inputs[0].address" />&nbsp;to&nbsp;
        <Bech32 :address="sessionAddress" />
      </template>
      <span v-if="transaction.memo">&nbsp;- {{ transaction.memo }}</span>
    </div>
  </div>
</template>

<script>
import { atoms, viewDenom, prettyLong } from "scripts/num.js"
import Bech32 from "common/Bech32"
import { getMultiSendCoin } from "scripts/transaction-utils"

export default {
  name: `multi-send-message-details`,
  filters: {
    atoms,
    viewDenom,
    prettyLong
  },
  components: {
    Bech32
  },
  props: {
    transaction: {
      type: Object,
      required: true
    },
    show: {
      type: String,
      required: true
    },
    sessionAddress: {
      type: String,
      required: false,
      default: null
    }
  },
  computed: {
    coin() {
      return getMultiSendCoin(this.transaction, this.sessionAddress)
    },
    toYourself() {
      return (
        this.transaction.value.from_address === this.sessionAddress &&
        this.transaction.value.to_address === this.sessionAddress
      )
    },
    sentFromSessionAddress() {
      return (
        this.sessionAddress === this.transaction.value.from_address &&
        this.sessionAddress !== this.transaction.value.to_address
      )
    },
    receivedToSessionAddress() {
      return (
        this.sessionAddress === this.transaction.value.to_address &&
        this.sessionAddress !== this.transaction.value.from_address
      )
    },
    caption() {
      if (this.transaction.value.inputs[0].address === this.sessionAddress) {
        return "Sent"
      } else {
        return "Received"
      }
    }
  }
}
</script>
