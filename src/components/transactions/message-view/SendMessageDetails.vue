<template>
  <div>
    <div class="tx__content__caption">
      <p>
        {{ caption }}
        <b> {{ coin.amount | atoms | prettyLong }}</b>
        <span> {{ coin.denom | viewDenom }}</span>
      </p>
    </div>
    <div class="tx__content__information">
      <template
        v-if="toYourself"
      >
        To yourself!
      </template>
      <template v-else-if="sentFromSessionAddress">
        To&nbsp;
        <Bech32 :address="transaction.recipientAddress" />
      </template>
      <template v-else-if="receivedToSessionAddress">
        From&nbsp;
        <Bech32 :address="transaction.senderAddress" />
      </template>
      <template v-else>
        From&nbsp;
        <Bech32 :address="transaction.senderAddress" />&nbsp;to&nbsp;
        <Bech32 :address="transaction.recipientAddress" />
      </template>
      <span v-if="transaction.memo">&nbsp;- {{ transaction.memo }}</span>
    </div>
  </div>
</template>

<script>
import { atoms, viewDenom, prettyLong } from "scripts/num.js"
import Bech32 from "common/Bech32"

export default {
  name: `send-message-details`,
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
    sessionAddress: {
      type: String,
      required: false,
      default: null
    }
  },
  computed: {
    coin() {
      return this.transaction.amount
    },
    toYourself() {
      return (
        this.transaction.senderAddress === this.sessionAddress &&
        this.transaction.recipientAddress === this.sessionAddress
      )
    },
    sentFromSessionAddress() {
      return (
        this.sessionAddress === this.transaction.senderAddress &&
        this.sessionAddress !== this.transaction.recipientAddress
      )
    },
    receivedToSessionAddress() {
      return (
        this.sessionAddress === this.transaction.recipientAddress &&
        this.sessionAddress !== this.transaction.senderAddress
      )
    },
    caption() {
      if (
        this.transaction.recipientAddress === this.sessionAddress &&
        this.transaction.senderAddress !== this.sessionAddress
      ) {
        return "Received"
      } else {
        return "Sent"
      }
    }
  }
}
</script>
