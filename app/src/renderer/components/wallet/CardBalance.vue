<template lang="pug">
.card-balance
  .card-balance-container
    .left
      .title
        i.fa.fa-circle-o
        span {{ balance.denom.toUpperCase() }}
      .balance
        .unit Balance:
        .value
          span.integer {{ integerize(balance.amount) }}
          span.fraction {{ fractionize(balance.amount) }}
      .actions
        btn(icon='search', value='Details')
</template>

<script>
import Btn from '@nylira/vue-button'
export default {
  name: 'card-balance',
  components: {
    Btn
  },
  methods: {
    capitalize (string) {
      return string.toUpperCase()
    },
    integerize (num) {
      return Math.trunc(num)
    },
    fractionize (num) {
      let value = Math.trunc(num % 1 * 100000) / 100000
      return value.toString().substring(1)
    },
    setExpanded (value) {
      this.$store.commit('setWalletExpanded',
        { key: this.walletKey, value: value })
    }
  },
  props: ['balance']
}
</script>

<style lang="stylus">
@require '~variables'

.card-balance
  font-size sm
  padding 0.25em

  .card-balance-container
    background app-fg

    height 3rem
    display flex
    align-items stretch

    .left
      flex 1
      display flex
      overflow hidden

    .title
      display flex
      align-items center
      border-right px dotted bc
      padding 0 0.75em
      width 8rem

      i.fa
        color dim
        margin-right 0.375em
      span
        mono()
        font-size sm
        font-weight bold

    .balance
      overflow hidden
      border-right px dotted bc

      flex 1
      display flex 
      align-items center
      padding 0 0.75em

      .unit
        color dim
        margin-right 0.25em

      .value
        .fraction
          color dim

    .actions
      display flex
      align-items center

      padding 0 0.75em

@media screen and (min-width: 400px)
  .card-balance
    font-size x
</style>
