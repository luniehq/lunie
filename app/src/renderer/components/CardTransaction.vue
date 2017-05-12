<template>
  <ul class="card-transaction">
    <li class="date">{{ date }}</li>
    <template v-for="coin in tran.inputs[0].coins">
      <li class="input">
        <span class="key">Denom</span>
        <span class="value">{{ coin.denom }}</span>
      </li>
      <li class="input">
        <span class="key">Balance</span>
        <span :class="valueCss(coin.amount)">{{ coin.amount }}</span>
      </li>
    </template>
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
  methods: {
    valueCss (num) {
      let v = 'value'
      if (num > 0) {
        v += ' positive'
      } else if (num < 0) {
        v += ' negative'
      }
      return v
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

    .value
      display inline-block

      &.positive
        color hsl(120,100%,35%)
        &:before
          content '+'
          display inline-block

      &.negative
        color hsl(0,100%,35%)
        &:before
          content '-'
          display inline-block

ul.card-transaction:first-of-type
  border-top 1px solid bc
ul.card-transaction:last-of-type
  border-bottom 1px solid bc
</style>
