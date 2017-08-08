<template>
  <div class="card-balance">
    <div class="card-balance-container">
      <div class="left">
        <div class="title">
          <i class="fa fa-circle-o"></i>
          <span>{{ balance.denom.toUpperCase() }}</span>
        </div>
        <div class="balance">
          <div class="unit">Balance:</div>
          <div class="value">
            <span class="integer">{{ integerize(balance.amount) }}</span><span class="fraction">{{ fractionize(balance.amount) }}</span>
          </div>
        </div>
        <div class="actions">
          <btn icon="search" value="Details"></btn>
        </div>
      </div>
    </div>
  </div>
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
@require '../../styles/variables.styl'

.card-balance
  font-size 0.75em
  padding 0.25em

  .card-balance-container
    background c-app-fg

    height 3em
    display flex
    align-items stretch

    .left
      flex 1
      display flex
      overflow hidden

    .title
      display flex
      align-items center
      border-right 1px dotted bc
      padding 0 0.75em
      width 8rem

      i.fa
        color light
        margin-right 0.375em
      span
        mono()
        font-size 0.75em
        font-weight bold

    .balance
      overflow hidden
      border-right 1px dotted bc

      flex 1
      display flex 
      align-items center
      padding 0 0.75em

      .unit
        color light
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
    font-size 0.875rem

@media screen and (min-width: 640px)
  .card-balance
    font-size 1rem

</style>
