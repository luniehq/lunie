<template>
  <ul class="card-transaction">
    <li class="date">{{ date }}</li>
    <li>
      <span class="key">gas</span>
      <span class="value">{{ tran.gas }}</span>
    </li>
    <li>
      <span class="key">fee </span>
      <span class="value">{{ tran.fee.amount }}</span>
    </li>
    <li v-for="coin in tran.inputs[0].coins" class="input">
      <span class="key">{{ coin.denom }}</span>
      <span class="value">{{ coin.amount }}</span>
    </li>
  </ul>
</template>

<script>
export default {
  computed: {
    tran () {
      return this.transactionValue.tx
    },
    date () {
      return new Date(this.transactionValue.time).toLocaleString()
    }
  },
  props: ['transaction-value']
}
</script>

<style lang="stylus">
@require '../styles/variables.styl'

ul.card-transaction
  padding 0.25em 0.5em
  background c-app-fg

  display flex

  border-left 1px solid bc
  border-right 1px solid bc
  border-bottom 1px dotted bc
  li
    flex 1
    display flex
    .key
      color light
      padding-right 0.5rem
    &.date, &.input
      flex 2

ul.card-transaction:first-of-type
  border-top 1px solid bc
ul.card-transaction:last-of-type
  border-bottom 1px solid bc
</style>
