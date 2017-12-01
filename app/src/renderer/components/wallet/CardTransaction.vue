<template lang='pug'>
.card-transaction
  .key-value(v-for='coin in coins')
    .value(:class='sign(coin.amount * (sent ? -1 : 1))') {{ coin.amount }}
    .key {{ coin.denom.toUpperCase() }}
  .date {{ date }}
</template>

<script>
import { mapGetters } from 'vuex'
import dateUnixAgo from 'scripts/dateUnixAgo'
export default {
  computed: {
    ...mapGetters([ 'wallet' ]),
    // TODO: sum relevant inputs/outputs
    sent () {
      return this.transactionValue.tx.inputs[0].sender === this.wallet.key.address
    },
    received () {
      return this.transactionValue.tx.outputs[0].receiver === this.wallet.key.address
    },
    coins () {
      return this.transactionValue.tx.inputs[0].coins
    },
    date () {
      return dateUnixAgo(this.transactionValue.time)
    }
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
