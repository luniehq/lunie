<template lang='pug'>
.card-transaction
  .key-value(v-for='coin in coins')
    .value(:class='sent ? "negative" : "positive"') {{ coin.amount }}
    .key {{ coin.denom.toUpperCase() }}
  .date {{ date }}
</template>

<script>
import dateUnixAgo from 'scripts/dateUnixAgo'
export default {
  computed: {
    // TODO: sum relevant inputs/outputs
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

.card-transaction
  display flex
  align-items center

  border-bottom px solid bc
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
