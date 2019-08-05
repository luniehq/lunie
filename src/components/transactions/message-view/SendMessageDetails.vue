<template>
  <div>
    <div class="tx__content__caption">
      <p>
        {{ caption }}
        <b>{{ coin.amount | atoms | prettyLong }}</b>
        <span>{{ coin.denom | viewDenom }}</span>
      </p>
    </div>
    <div class="tx__content__information">
      <template v-if="toYourself">To yourself!</template>
      <template v-else-if="sentFromSessionAddress">
        To&nbsp;
        <Bech32 :address="transaction.value.to_address" />
      </template>
      <template v-else-if="receivedToSessionAddress">
        From&nbsp;
        <Bech32 :address="transaction.value.from_address" />
      </template>
      <template v-else>
        From&nbsp;
        <Bech32 :address="transaction.value.from_address" />&nbsp;to&nbsp;
        <Bech32 :address="transaction.value.to_address" />
      </template>
      <span v-if="transaction.memo">&nbsp;- {{ transaction.memo }}</span>
    </div>
  </div>
</template>

<script>
import { atoms, viewDenom, prettyLong } from "scripts/num.js"
import Bech32 from "common/Bech32"
import { getCoin } from "scripts/transaction-utils"

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
      return getCoin(this.transaction)
    },
    toYourself() {
      const value = this.transaction.value
      return (
        value.from_address === this.sessionAddress &&
        value.to_address === this.sessionAddress
      )
    },
    other() {
      const value = this.transaction.value
      return (
        this.sessionAddress !== value.from_address &&
        this.sessionAddress !== value.to_address
      )
    },
    sentFromSessionAddress() {
      const value = this.transaction.value
      return (
        this.sessionAddress === value.from_address &&
        this.sessionAddress !== value.to_address
      )
    },
    receivedToSessionAddress() {
      const value = this.transaction.value
      return (
        this.sessionAddress === value.to_address &&
        this.sessionAddress !== value.from_address
      )
    },
    caption() {
      const value = this.transaction.value
      if (
        value.to_address === this.sessionAddress &&
        value.from_address !== this.sessionAddress
      ) {
        return "Received"
      } else {
        return "Sent"
      }
    }
  }
}
</script>
