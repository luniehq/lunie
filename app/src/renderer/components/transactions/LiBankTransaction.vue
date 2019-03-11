<template>
  <li-transaction
    :color="`#ED553B`"
    :time="transaction.time"
    :block="transaction.height"
  >
    <template v-if="sent">
      <div slot="caption">
        Sent&nbsp;
        <b>{{ full(atoms(coins.amount)) }}</b>
        <span>&nbsp;{{ coins.denom.toUpperCase() }}</span>
      </div>
      <span slot="details">
        <template v-if="sentSelf">
          To yourself!
        </template><template v-else>
          To {{ receiver }}
        </template>
      </span>
    </template><template v-else>
      <div slot="caption">

        Received&nbsp;
        <b>{{ full(atoms(coins.amount)) }}</b>
        <span>&nbsp;{{ coins.denom.toUpperCase() }}</span>
      </div>
      <span slot="details">From {{ sender }}</span>
    </template>
  </li-transaction>
</template>

<script>
import LiTransaction from "./LiTransaction"
import { atoms, full } from "../../scripts/num.js"

export default {
  name: `li-bank-transaction`,
  components: { LiTransaction },
  props: {
    transaction: {
      type: Object,
      required: true
    },
    address: {
      type: String,
      default: null
    }
  },
  data: () => ({
    atoms,
    full
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
      return this.tx.amount[0]
    },
    receiver() {
      return this.tx.to_address
    }
  }
}
</script>
