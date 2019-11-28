<template>
  <div class="tx__content">
    <TransactionIcon
      :transaction-group="transaction.group"
      :transaction-type="caption"
    />
    <div class="tx__content__left">
      {{ caption }}
      <template v-if="toYourself">
        to yourself!
      </template>
      <template v-else-if="sentFromSessionAddress">
        to
        <Bech32 :address="transaction.value.to_address" />
      </template>
      <template v-else-if="receivedToSessionAddress">
        from
        <Bech32 :address="transaction.value.inputs[0].address" />
      </template>
      <template v-else>
        from
        <Bech32 :address="transaction.value.inputs[0].address" /> to
        <Bech32 :address="sessionAddress" />
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
import { getMultiSendCoin } from "scripts/transaction-utils"
import TransactionIcon from "../TransactionIcon"

export default {
  name: `multi-send-message-details`,
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
      return getMultiSendCoin(this.transaction, this.sessionAddress)
    },
    toYourself() {
      let toYourself = false
      if (this.transaction.value.inputs[0].address === this.sessionAddress) {
        this.transaction.value.outputs.map(output => {
          if (output.address === this.sessionAddress) {
            toYourself = true
          }
        })
      }
      return toYourself
    },
    sentFromSessionAddress() {
      if (this.transaction.value.inputs[0].address === this.sessionAddress) {
        return true
      } else {
        return false
      }
    },
    receivedToSessionAddress() {
      let receivedToSessionAddress = false
      if (this.transaction.value.inputs[0].address !== this.sessionAddress) {
        this.transaction.value.outputs.map(output => {
          if (output.address === this.sessionAddress) {
            receivedToSessionAddress = true
          }
        })
      }
      return receivedToSessionAddress
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
