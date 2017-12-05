<template lang='pug'>
.ni-li-tx
  .tx-element.tx-coin(v-for='coin in coins')
    .value(:class="sent ? 'negative' : 'positive'") {{ coin.amount }}
    .key {{ coin.denom }}
  .tx-element.tx-date {{ date }}
  .tx-element.tx-address(v-if="sent") {{ receiver }}
  .tx-element.tx-address(v-else) {{ sender }}
</template>

<script>
import dateUnixAgo from 'scripts/dateUnixAgo'
export default {
  name: 'ni-li-tx',
  computed: {
    // TODO: sum relevant inputs/outputs
    sender () {
      return this.transactionValue.tx.inputs[0].sender
    },
    receiver () {
      return this.transactionValue.tx.outputs[0].receiver
    },
    sent () {
      return this.transactionValue.tx.inputs[0].sender === this.address
    },
    coins () {
      return this.transactionValue.tx.inputs[0].coins
    },
    date () {
      return dateUnixAgo(this.transactionValue.time)
    }
  },
  props: ['transaction-value', 'address']
}
</script>

<style lang="stylus">
@require '~variables'

.ni-li-tx
  height 4rem
  display flex
  flex-flow row wrap
  align-items center
  justify-content center

  font-size sm
  border-bottom 1px solid bc
  padding 0.5rem

  .tx-element
    padding 0 0.5rem
    line-height 1.5rem
    flex 50%

  .tx-coin
    display flex
    flow-flow row nowrap
    .key, .value
      flex 1
    .value
      text-align right
      &:before
        content ''
        display inline
      &.negative
        color danger
        &:before
          content '-'
      &.positive
        color success
        &:before
          content '+'
    .key
      padding-left 0.5rem

  .tx-date
    color dim

  .tx-address
    flex 100%

    white-space nowrap
    overflow hidden
    text-overflow ellipsis

    color dim

</style>
