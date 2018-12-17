<template lang="pug">
tm-li-transaction(:color="color" :time="transaction.time" :block="transaction.height")
  template(v-if="sent")
    div(slot="caption")
      | Sent&nbsp;
      b {{coinsSent.amount}}
      span &nbsp;{{coinsSent.denom.toUpperCase()}}
    span(slot="details")
      template(v-if="sentSelf") To yourself!
      template(v-else) To {{receiver}}
  template(v-else)
    div(slot="caption")
      | Received&nbsp;
      b {{coinsReceived.amount}}
      span &nbsp;{{coinsReceived.denom.toUpperCase()}}
    span(slot="details") From {{sender}}
</template>

<script>
import numeral from "numeral"

const defaultCoin = {
  denom: null,
  amount: null
}

const defaultInput = {
  address: null,
  coins: [defaultCoin, defaultCoin, defaultCoin]
}

const defaultTransaction = {
  tx: {
    value: {
      msg: [
        {
          value: {
            time: null,
            inputs: [defaultInput, defaultInput, defaultInput],
            outputs: [defaultInput, defaultInput, defaultInput]
          }
        }
      ]
    }
  }
}

import TmLiTransaction from "../TmLiTransaction/TmLiTransaction"
import colors from "../TmLiTransaction/transaction-colors.js"

export default {
  name: "tm-li-bank-transaction",
  components: { TmLiTransaction },
  computed: {
    tx() {
      return this.transaction.tx.value.msg[0].value
    },
    // TODO: sum relevant inputs/outputs
    sentSelf() {
      return this.tx.inputs[0].address === this.tx.outputs[0].address
    },
    sent() {
      return this.tx.inputs[0].address === this.address
    },
    sender() {
      return this.tx.inputs[0].address
    },
    coinsSent() {
      return this.tx.inputs[0].coins[0]
    },
    receiver() {
      return this.tx.outputs[0].address
    },
    coinsReceived() {
      return this.tx.inputs[0].coins[0]
    },
    color() {
      if (this.sent) return colors.bank.sent
      return colors.bank.received
    },
    details() {
      if (this.sent) {
        return `To ${this.receiver}`
      }
      return `From ${this.sender}`
    }
  },
  methods: {
    pretty(num) {
      return numeral(num).format("0,0.00")
    },
    viewTransaction() {
      // console.log("TODO: implement tx viewer")
    }
  },
  props: {
    transaction: {
      type: Object,
      default: () => defaultTransaction
    },
    address: {
      type: String,
      default: null
    }
  }
}
</script>

<style lang="stylus">
@require '~variables'

.tm-li-tx
  display flex
  font-size sm

  .tx-icon
    padding 0 0.5rem
    background var(--app-fg)
    display flex
    align-items center
    justify-content center

  .tx-container
    flex-direction column
    flex-wrap nowrap
    padding 0.5rem 0
    margin 0.5rem 0
    display flex
    width 100%
    min-width 0 // fix text-overflow

  .tx-element
    padding 0 2rem 0 1.5rem
    line-height 1.5rem

  .tx-coin
    .value
      flex 0 0 100%
      font-size sm
      color var(--dim)

      &:before
        content ''
        display inline

    .key
      font-weight 500
      font-size m

    .value, .key
      line-height 1.5rem

  .tx-address
    white-space nowrap
    overflow hidden
    text-overflow ellipsis
    color var(--dim)
    font-size sm

  &.tm-li-tx-sent
    .tx-coin .value
      &:before
        content '-'

  &.tm-li-tx-received
    .tx-icon
      background var(--app-fg)

    .tx-coin .value
      color success

      &:before
        content '+'

  &:hover
    cursor pointer

@media screen and (min-width: 700px)
  .tm-li-tx
    font-size 0.875rem

    .tx-container
      flex-direction row

      .tx-coins
        flex 0 0 9rem
        padding 0
        min-width 0

        .tx-coin
          padding 0 1.5rem 0

          .key
            white-space nowrap
            overflow hidden
            text-overflow ellipsis
</style>
