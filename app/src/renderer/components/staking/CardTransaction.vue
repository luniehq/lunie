<template>
  <ul class="card-transaction">
    <li class="date">{{ date }}</li>
    <template v-for="coin in tran.inputs[0].coins">
      <li class="balance">
        <span :class="valueCss(coin.amount)">{{ coin.amount }}</span>
      </li>
      <li class="denom">
        <span class="value">{{ coin.denom.toUpperCase() }}</span>
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
@require '../../styles/variables.styl'

ul.card-transaction
  padding 0.25em 0.5em
  background app-fg

  display flex
  align-items center

  border-left 1px solid bc
  border-right 1px solid bc

  &:nth-of-type(2n)
    background lighten(app-bg, 50%)

  mono()
  height 2rem
  font-size 0.875rem
  li
    display flex
    align-items center
    &.balance
      flex 1
      .value
        text-align right

    &.denom
      width 10rem
      padding 0 1rem

    .key
      color light
      padding-right 0.5rem
      text-transform uppercase
      font-weight bold
      font-size 0.666rem
      letter-spacing 0.05em

    .value
      flex 1
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
