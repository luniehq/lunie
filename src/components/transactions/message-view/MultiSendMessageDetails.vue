<template>
  <div class="tx__content">
    <TransactionIcon
      :transaction-group="transaction.group"
      :transaction-type="type"
    />
    <div class="tx__content__left">
      <h3>{{ caption }}</h3>
      <template v-if="toYourself">
        <span>To yourself —&nbsp;</span>
      </template>
      <template v-else-if="isSent">
        <span>To&nbsp;</span>
        <Bech32 :address="recipient" />
      </template>
      <template v-else>
        <span>From&nbsp;</span>
        <Bech32 :address="sender" />
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
      default: null
    }
  },
  computed: {
    recipient() {
      let index = this.transaction.value.inputs.findIndex(
        input => input.address === this.sessionAddress
      )
      if (index !== undefined && this.transaction.value.outputs[index]) {
        return this.transaction.value.outputs[index].address
      }
      return ""
    },
    sender() {
      let index = this.transaction.value.outputs.findIndex(
        output => output.address === this.sessionAddress
      )
      if (index !== undefined && this.transaction.value.inputs[index]) {
        return this.transaction.value.inputs[index].address
      }
      return ""
    },
    isSent() {
      return this.transaction.value.inputs.find(
        input => input.address === this.sessionAddress
      )
    },
    coin() {
      return getMultiSendCoin(this.transaction, this.sessionAddress)
    },
    toYourself() {
      let toYourself = false
      if (this.isSent) {
        this.transaction.value.outputs.map(output => {
          if (output.address === this.sessionAddress) {
            toYourself = true
          }
        })
      }
      return toYourself
    },
    type() {
      if (this.isSent) {
        return "Sent"
      } else {
        return "Received"
      }
    },
    caption() {
      if (this.isSent) {
        return "Sent"
      } else {
        return "Received"
      }
    }
  }
}
</script>
