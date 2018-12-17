<template lang="pug">
tm-li-transaction(:color="color" :time="transaction.time" :block="transaction.height")
  template(v-if="propose")
    div(slot="caption")
      | Submitted {{ tx.proposal_type.toLowerCase()}} proposal initial deposit&nbsp;
      b {{ prettify(tx.initial_deposit[0].amount) }}
      span &nbsp;{{ tx.initial_deposit[0].denom }}s
    div(slot="details")
      | Title:&nbsp;
      i {{ tx.title }}
  template(v-if="deposit")
    div(slot="caption")
      | Deposited&nbsp;
      template
        b {{ prettify(tx.amount[0].amount) }}
        span &nbsp;{{ tx.amount[0].denom }}s
    div(slot="details")
      | On&nbsp;
      router-link(:to="this.URL + '/' + tx.proposal_id") Proposal &#35;{{ tx.proposal_id }}
</template>

<script>
import TmLiTransaction from "./TmLiTransaction/TmLiTransaction"
import colors from "./TmLiTransaction/transaction-colors.js"
import numeral from "numeral"

export default {
  name: `tm-li-gov-transaction`,
  components: { TmLiTransaction },
  props: {
    transaction: Object,
    URL: {
      type: String,
      default: ``
    },
    bondingDenom: {
      type: String,
      default: `atom`
    }
  },
  computed: {
    tx() {
      return this.transaction.tx.value.msg[0].value
    },
    type() {
      return this.transaction.tx.value.msg[0].type
    },
    propose() {
      return this.type === `cosmos-sdk/MsgSubmitProposal`
    },
    deposit() {
      return this.type === `cosmos-sdk/MsgDeposit`
    },
    color() {
      if (this.propose) return colors.gov.propose
      if (this.deposit) return colors.gov.deposit
    }
  },
  methods: {
    prettify(amount) {
      const amountNumber = Number(amount)
      return numeral(amountNumber).format(
        Number.isInteger(amountNumber) ? `0,0` : `0,0.00`
      )
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
      font-size var(--sm)
      color var(--dim)

      &:before
        content ''
        display inline

    .key
      font-weight 500
      font-size var(--m)

    .value, .key
      line-height 1.5rem

  &.tm-li-tx-sent
    .tx-coin .value
      &:before
        content '-'

  &.tm-li-tx-received
    .tx-icon
      background var(--app-fg)

    .tx-coin .value
      color var(--success)

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
