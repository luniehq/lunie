<template>
  <div>
    <div v-if="show === `caption`" class="tx__content">
      <TransactionIcon
        :transaction-group="transaction.group"
        :transaction-type="caption"
      />
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
      let sentFromSessionAddress = false
      if (this.transaction.value.inputs[0].address === this.sessionAddress) {
        sentFromSessionAddress = true
        this.transaction.value.outputs.map(output => {
          if (output.address === this.sessionAddress) {
            sentFromSessionAddress = false
          }
        })
      }
      return sentFromSessionAddress
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
