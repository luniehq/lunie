<template>
  <LiTransaction
    :color="`#ED553B`"
    :time="time"
    :block="block"
    :memo="memo"
    :fees="fees"
  >
    <template v-if="address === ''">
      <div slot="caption">
        Sent <b>{{ txAmount | toAtoms | shortDecimals }}</b>
        <span>{{ txDenom | viewDenom }}</span>
      </div>
      <span slot="details">
        <template>
          From <ShortBech32 :address="sender" /> to
          <ShortBech32 :address="receiver" />
        </template>
      </span>
    </template>
    <template v-else-if="sent">
      <div slot="caption">
        Sent <b>{{ txAmount | toAtoms | shortDecimals }}</b>
        <span>{{ txDenom | viewDenom }}</span>
      </div>
      <span slot="details">
        <template v-if="sentSelf">
          To yourself!
        </template>
        <template v-else>
          To <ShortBech32 :address="receiver" />
        </template>
      </span>
    </template>
    <template v-else>
      <div slot="caption">
        Received <b>{{ txAmount | toAtoms | shortDecimals }}</b>
        <span>{{ txDenom | viewDenom }}</span>
      </div>
      <span slot="details">
        From &nbsp; <ShortBech32 :address="sender" />
      </span>
    </template>
  </LiTransaction>
</template>

<script>
import ShortBech32 from "common/ShortBech32"
import LiTransaction from "./LiTransaction"
import {
  atoms as toAtoms,
  viewDenom,
  shortDecimals
} from "../../scripts/num.js"

export default {
  name: `li-bank-transaction`,
  components: {
    ShortBech32,
    LiTransaction
  },
  filters: {
    toAtoms,
    viewDenom,
    shortDecimals
  },
  props: {
    tx: {
      type: Object,
      required: true
    },
    fees: {
      type: Object,
      required: true
    },
    address: {
      type: String,
      default: null
    },
    bondingDenom: {
      type: String,
      required: true
    },
    time: {
      type: String,
      required: true
    },
    block: {
      type: Number,
      required: true
    },
    memo: {
      type: String,
      default: null
    }
  },
  computed: {
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
    receiver() {
      return this.tx.to_address
    },
    txAmount() {
      return this.tx.amount[0].amount
    },
    txDenom() {
      return this.tx.amount[0].denom
    }
  }
}
</script>
