<template lang='pug'>
mixin tx-container-sent
  .tx-container
    .tx-element.tx-coins
      .tx-coin(v-for='coin in coinsSent')
        .value {{ num.pretty(coin.amount) }}
        .key {{ coin.denom }}
    .tx-element.tx-date(v-if="devMode") {{ date }}
    .tx-element.tx-address {{ receiver }}

.ni-li-tx(v-if="sentSelf" @click="() => devMode && viewTransaction()")
  .tx-icon: i.material-icons swap_horiz
  +tx-container-sent

.ni-li-tx.ni-li-tx-sent(v-else-if="sent" @click="() => devMode && viewTransaction()")
  .tx-icon: i.material-icons remove_circle
  +tx-container-sent

.ni-li-tx.ni-li-tx-received(v-else @click="() => devMode && viewTransaction()")
  .tx-icon: i.material-icons add_circle
  .tx-container
    .tx-element.tx-coins
      .tx-coin(v-for='coin in coinsReceived')
        .value {{ num.pretty(coin.amount) }}
        .key {{ coin.denom }}
    .tx-element.tx-date(v-if="devMode") {{ date }}
    .tx-element.tx-address {{ sender }}
</template>

<script>
import num from 'scripts/num'
import moment from 'moment'
export default {
  name: 'ni-li-tx',
  computed: {
    // TODO: sum relevant inputs/outputs
    sentSelf () {
      return this.transactionValue.tx.inputs[0].sender === this.transactionValue.tx.outputs[0].receiver
    },
    sent () {
      return this.transactionValue.tx.inputs[0].sender === this.address
    },
    sender () {
      return this.transactionValue.tx.inputs[0].sender
    },
    coinsSent () {
      return this.transactionValue.tx.inputs[0].coins
    },
    receiver () {
      return this.transactionValue.tx.outputs[0].receiver
    },
    coinsReceived () {
      return this.transactionValue.tx.inputs[0].coins
    },
    date () {
      return this.transactionValue.time ? moment(this.transactionValue.time).fromNow() : 'N/A'
    }
  },
  data: () => ({
    num: num
  }),
  methods: {
    viewTransaction () {
      this.$store.commit('notify', {
        title: 'TODO: View Transaction',
        body: 'tx details page not implemented yet'
      })
    }
  },
  props: ['transaction-value', 'address', 'devMode']
}
</script>

<style lang="stylus">
@require '~variables'

.ni-li-tx
  display flex
  font-size sm
  border-bottom 1px solid bc-dim
  min-height 3rem

  .tx-icon
    flex 0 0 2rem
    background app-fg
    display flex
    align-items center
    justify-content center

  .tx-container
    flex 1
    padding 0.5rem 0
    display flex
    flex-flow row wrap
    align-items flex-start
    justify-content center

    min-width 0 // fix text-overflow

  .tx-element
    padding 0 0.5rem
    line-height 1.5rem

  .tx-coins
    flex 0 0 60%

  .tx-coin
    display flex
    flow-flow row nowrap
    .value
      flex 3
      text-align right
      &:before
        content ''
        display inline
    .key
      flex 2
      padding-left 0.5rem

  .tx-date
    flex 0 0 40%
    color dim

  .tx-address
    flex 100%

    white-space nowrap
    overflow hidden
    text-overflow ellipsis

    color dim

  &.ni-li-tx-sent
    .tx-icon
      background alpha(mc, 5%)
      i
        color danger
    .tx-coin .value
      color danger
      &:before
        content '-'

  &.ni-li-tx-received
    .tx-icon
      background alpha(link, 5%)
      i
        color success
    .tx-coin .value
      color success
      &:before
        content '+'

  &:hover
    cursor pointer
    background app-fg
    .tx-coin
      .key
        color txt
    .tx-date, .tx-address
      color txt

@media screen and (min-width: 375px)
  .ni-li-tx
    font-size 0.875rem
@media screen and (min-width: 414px)
  .ni-li-tx
    .tx-container
      padding 0.5rem

@media screen and (min-width: 768px)
  .ni-li-tx
    .tx-icon
      flex 0 0 3rem

    .tx-container
      flex-flow row nowrap

    .tx-element
      line-height 2rem

    .tx-coins
      flex 3

    .tx-date
      flex 2

    .tx-address
      flex 6
</style>
