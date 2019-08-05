<template>
  <LiTransaction
    :color="`#ED553B`"
    :time="time"
    :block="block"
    :memo="memo"
    :fees="fees"
    :hide-meta-data="hideMetaData"
  >
    <template v-if="address === ''">
      <div slot="caption">
        Sent
        <b>{{ txAmount | toAtoms | prettyLong }}</b>
        <span>{{ txDenom | viewDenom }}</span>
      </div>
      <span slot="details">
        <template>
          From
          <Bech32 :address="sender" /> to
          <Bech32 :address="receiver" />
        </template>
      </span>
    </template>
    <template v-else-if="sent">
      <div slot="caption">
        Sent
        <b>{{ txAmount | toAtoms | prettyLong }} </b>
        <span>{{ txDenom | viewDenom }}</span>
      </div>
      <span slot="details">
        <template v-if="sentSelf">
          To yourself!
        </template>
        <template v-else>
          To
          <Bech32 :address="receiver" />
        </template>
      </span>
    </template>
    <template v-else>
      <div slot="caption">
        Received
        <b>{{ txAmount | toAtoms | prettyLong }} </b>
        <span>{{ txDenom | viewDenom }}</span>
      </div>
      <span slot="details">From <Bech32 :address="sender"/></span>
    </template>
  </LiTransaction>
</template>

<script>
import Bech32 from "common/Bech32"
import LiTransaction from "./LiTransaction"
import { atoms as toAtoms, viewDenom, prettyLong } from "../../scripts/num.js"

export default {
  name: `li-bank-transaction`,
  components: {
    Bech32,
    LiTransaction
  },
  filters: {
    toAtoms,
    viewDenom,
    prettyLong
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
      default: null
    },
    block: {
      type: Number,
      required: true
    },
    memo: {
      type: String,
      default: null
    },
    hideMetaData: {
      type: Boolean,
      default: false
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
