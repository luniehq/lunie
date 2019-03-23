<template>
  <li-transaction
    :color="`#ED553B`"
    :time="time"
    :block="block"
  >
    <template v-if="address === ''">
      <div slot="caption">
        Sent<b>{{ full(atoms(coins.amount)) }}</b>
        <span>{{ coins.denom }}s</span>
      </div>
      <span slot="details">
        <template>
          From <short-bech32 :address="sender" />
          to <short-bech32 :address="receiver" />
        </template>
      </span>
      <div slot="fees">
        Network Fee:&nbsp;<b>{{ fees ? full(atoms(fees.amount)) : full(0) }}</b>
        <span>{{ fees ? fees.denom : bondingDenom }}s</span>
      </div>
    </template>
    <template v-else-if="sent">
      <div slot="caption">
        Sent
        <b>{{ full(atoms(coins.amount)) }}</b>
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
        Network Fee:&nbsp;<b>{{ fees ? full(atoms(fees.amount)) : full(0) }}</b>
        <span>{{ fees ? fees.denom : bondingDenom }}s</span>
      </div>
    </template>
    <template v-else>
      <div slot="caption">
        Received
        <b>{{ full(atoms(coins.amount)) }}</b>
        <span>{{ coins.denom }}s</span>
      </div>
      <span slot="details">From <short-bech32 :address="sender" /></span>
      <div slot="fees">
        Network Fee:&nbsp;<b>{{ fees ? full(atoms(fees.amount)) : full(0) }}</b>
        <span>{{ fees ? fees.denom : bondingDenom }}s</span>
      </div>
    </template>
  </li-transaction>
</template>

<script>
import ShortBech32 from "common/ShortBech32"
import LiTransaction from "./LiTransaction"
import { atoms, full } from "../../scripts/num.js"
import { shortAddress } from "../../scripts/common"

export default {
  name: `li-bank-transaction`,
  components: {
    ShortBech32,
    LiTransaction
  },
  props: {
    tx: {
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
    },
    time: {
      type: String,
      required: true
    },
    block: {
      type: Number,
      required: true
    }
  },
  data: () => ({
    atoms,
    full,
    shortAddress
  }),
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
    coins() {
      return this.tx.amount[0]
    },
    receiver() {
      return this.tx.to_address
    }
  }
}
</script>
