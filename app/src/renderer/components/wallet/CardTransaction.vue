<template lang='pug'>
.card-transaction
  .key-value(v-for='coin in tx.inputs[0].coins')
    .value(:class='sign(coin.amount)') {{ coin.amount }}
    .key {{ coin.denom.toUpperCase() }}
  .date {{ date }}
</template>

<script>
import dateUnixAgo from '../../scripts/dateUnixAgo'
export default {
  computed: {
    tx () {
      // return this.transactionValue.tx
      return this.transactionValue
    },
    date () { return dateUnixAgo(this.transactionValue.time) }
  },
  methods: {
    sign (num) {
      if (num > 0) {
        return 'positive'
      } else if (num < 0) {
        return 'negative'
      }
    }
  },
  props: ['transaction-value']
}
</script>

<style lang="stylus">
@require '~variables'

.card-transaction
  display flex
  align-items center

  border-bottom 1px solid bc
  height 3rem

  .date
    color dim
    padding 0 1rem

  .date, .key-value
    flex 1

  .key-value
    display flex
    flex-flow row nowrap
    padding 0 0.5rem

  .key, .value
    padding 0 0.5rem

  .value
    &.positive
      color success
      &:before
        content '+'
        display inline-block

    &.negative
      color warning
      &:before
        content '-'
        display inline-block
</style>
