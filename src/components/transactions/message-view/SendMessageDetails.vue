<template>
  <div class="tx__content">
    <TransactionIcon
      :transaction-group="transaction.group"
      :transaction-type="caption"
    />
    <div class="tx__content__left">
      <h3>{{ caption }}</h3>
      <template v-if="toYourself">
        <span>To yourself —&nbsp;</span>
        <Bech32 :address="transaction.value.to_address" />
      </template>
      <template v-else-if="sentFromSessionAddress">
        <span>To&nbsp;</span>
        <Bech32 :address="transaction.value.to_address" />
      </template>
      <template v-else-if="receivedToSessionAddress">
        <span>From&nbsp;</span>
        <Bech32 :address="transaction.value.from_address" />
      </template>
      <template v-else>
        <span>From&nbsp;</span>
        <Bech32 :address="transaction.value.from_address" />
        <i class="material-icons arrow">arrow_right_alt</i>
        <Bech32 :address="transaction.value.to_address" />
      </template>
    </div>
    <div class="tx__content__right">
      <p class="amount">
        {{ coin.amount | atoms | prettyLong }} {{ coin.denom | viewDenom }}
      </p>
    </div>
  </div>
</template>

<script>
import { atoms, viewDenom, prettyLong } from "scripts/num.js"
import Bech32 from "common/Bech32"
import { getCoin } from "scripts/transaction-utils"
import TransactionIcon from "../TransactionIcon"

export default {
  name: `send-message-details`,
  filters: {
    atoms,
    viewDenom,
    prettyLong
  },
  components: {
    Bech32,
    TransactionIcon
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
      if (
        this.transaction.value.to_address === this.sessionAddress &&
        this.transaction.value.from_address !== this.sessionAddress
      ) {
        return "Received"
      } else {
        return "Sent"
      }
    }
  }
}
</script>
