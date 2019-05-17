<template>
  <LiTransaction :color="`#ED553B`" :time="time" :block="block" :memo="memo">
    <template v-if="address === ''">
      <div slot="caption">
        Sent<b>{{ coins.amount }}</b>
        <span>{{ num.viewDenom(coins.denom) }}</span>
      </div>
      <span slot="details">
        <template>
          From
          <ShortBech32 :address="sender" /> to
          <ShortBech32 :address="receiver" />
        </template>
      </span>
      <div slot="fees">
        Network Fee:&nbsp;<b>{{ convertedFees ? convertedFees.amount : 0 }}</b>
        <span>
          {{
            convertedFees
              ? num.viewDenom(convertedFees.denom)
              : num.viewDenom(bondingDenom)
          }}
        </span>
      </div>
    </template>
    <template v-else-if="sent">
      <div slot="caption">
        Sent
        <b>{{ coins.amount }}</b>
        <span>{{ num.viewDenom(coins.denom) }}</span>
      </div>
      <span slot="details">
        <template v-if="sentSelf">
          To yourself!
        </template>
        <template v-else>
          To
          <ShortBech32 :address="receiver" />
        </template>
      </span>
      <div slot="fees">
        Network Fee:&nbsp;<b>{{ convertedFees ? convertedFees.amount : 0 }}</b>
        <span>
          {{
            convertedFees
              ? num.viewDenom(convertedFees.denom)
              : num.viewDenom(bondingDenom)
          }}
        </span>
      </div>
    </template>
    <template v-else>
      <div slot="caption">
        Received
        <b>{{ coins.amount }}</b>
        <span>{{ num.viewDenom(coins.denom) }}</span>
      </div>
      <span slot="details">
        From &nbsp;
        <ShortBech32 :address="sender" />
      </span>
      <div slot="fees">
        Network Fee:&nbsp;<b>{{ convertedFees ? convertedFees.amount : 0 }}</b>
        <span>
          {{
            convertedFees
              ? num.viewDenom(convertedFees.denom)
              : num.viewDenom(bondingDenom)
          }}
        </span>
      </div>
    </template>
  </LiTransaction>
</template>

<script>
import ShortBech32 from "common/ShortBech32"
import LiTransaction from "./LiTransaction"
import num from "../../scripts/num.js"

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
    },
    memo: {
      type: String,
      default: null
    }
  },
  data: () => ({
    num
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
      return this.tx.amount.map(num.createDisplayCoin)[0]
    },
    convertedFees() {
      return this.fees ? num.createDisplayCoin(this.fees) : undefined
    },
    receiver() {
      return this.tx.to_address
    }
  }
}
</script>
