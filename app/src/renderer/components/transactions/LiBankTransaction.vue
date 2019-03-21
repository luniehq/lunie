<template>
  <li-transaction
    :color="`#ED553B`"
    :time="transaction.time"
    :block="transaction.height"
  >
    <template v-if="address === ''">
      <div slot="caption">
        Sent<b>{{ coins.amount }}</b>
        <span>{{ coins.denom }}s</span>
      </div>
      <span slot="details">
        <template>
          From <short-bech32 :address="sender" />
          to <short-bech32 :address="receiver" />
        </template>
      </span>
      <div slot="fees">
        Network Fee:&nbsp;
        <b>{{ convertedFees ? convertedFees.amount : full(0) }}</b>
        <span>{{ convertedFees ? convertedFees.denom : bondingDenom }}s</span>
      </div>
    </template>
    <template v-else-if="sent">
      <div slot="caption">
        Sent
        <b>{{ coins.amount }}</b>
        <span>{{ coins.denom }}s</span>
      </div>
      <span slot="details">
        <template v-if="sentSelf">
          To yourself!
        </template>
        <template v-else>
          To <short-bech32 :address="receiver" />
        </template>
      </span>
      <div slot="fees">
        Network Fee:&nbsp;
        <b>{{ convertedFees ? convertedFees.amount : full(0) }}</b>
        <span>{{ convertedFees ? convertedFees.denom : bondingDenom }}s</span>
      </div>
    </template>
    <template v-else>
      <div slot="caption">
        Received
        <b>{{ coins.amount }}</b>
        <span>{{ coins.denom }}s</span>
      </div>
      <span slot="details">From <short-bech32 :address="sender" /></span>
      <div slot="fees">
        Network Fee:&nbsp;
        <b>{{ convertedFees ? convertedFees.amount : full(0) }}</b>
        <span>{{ convertedFees ? convertedFees.denom : bondingDenom }}s</span>
      </div>
    </template>
  </li-transaction>
</template>

<script>
import ShortBech32 from "common/ShortBech32"
import LiTransaction from "./LiTransaction"
import num, { atoms, full } from "../../scripts/num.js"
import { shortAddress } from "../../scripts/common"

export default {
  name: `li-bank-transaction`,
  components: {
    ShortBech32,
    LiTransaction
  },
  props: {
    transaction: {
      type: Object,
      required: true
    },
    fees: {
      type: Object,
      default: null
    },
    address: {
      type: String,
      default: null
    },
    bondingDenom: {
      type: String,
      required: true
    }
  },
  data: () => ({
    atoms,
    full,
    shortAddress
  }),
  computed: {
    tx() {
      return this.transaction.tx.value.msg[0].value
    },
    // TODO: sum relevant inputs/outputs
    sentSelf() {
      return this.tx.from_address === this.tx.to_address
    },
    sent() {
      return this.tx.from_address === this.address
    },
    sender() {
      return this.tx.from_address
    },
    coins() {
      return this.tx.amount.map(num.viewCoin)[0]
    },
    convertedFees() {
      return this.fees ? num.viewCoin(this.fees) : undefined
    },
    receiver() {
      return this.tx.to_address
    }
  }
}
</script>
