<template>
  <div class="card-wallet" @click="setExpanded(true)">
    <div class="card-wallet-container">
      <div class="left">
        <div class="title">
          <i class="fa fa-envelope-o"></i>
          <span>{{ capitalize(walletKey) }}</span>
        </div>
        <div class="balances">
          <div class="balance" v-for="coin in walletValue.coins">
            <div class="value">
              <span class="integer">{{ integerize(coin.amount) }}</span><span class="fraction">{{ fractionize(coin.amount) }}</span>
            </div>
            <div class="unit">{{ coin.denom.toUpperCase() }}</div>
          </div>
        </div>
      </div>
      <div v-if="walletValue.chainId" class="chain-id">
        {{ walletValue.chainId }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
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
  props: ['walletKey', 'walletValue']
}
</script>

<style lang="stylus">
@require '../styles/variables.styl'

.card-wallet
  font-size 0.75em
  padding 0.25em

  .card-wallet-container
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

      i.fa
        color light
        margin-right 0.375em
      span
        mono()
        font-size 0.75em
        font-weight bold

    .balances
      overflow hidden
      border-right 1px dotted bc

      flex 1
      display flex
      align-items center
      padding 0 0.5em

      .balance
        display flex
        padding 0 0.375em
        background c-app-bg
        margin 0 0.25em

        .value
          margin-right 0.25em
          .fraction
            color dim
        .unit
          color light

    .chain-id
      display flex
      align-items center

      padding 0 0.75em
      border-right 1px dotted bc

      mono()
      font-size 0.75em
      color light

@media screen and (min-width: 400px)
  .card-wallet
    font-size 0.875rem

@media screen and (min-width: 640px)
  .card-wallet
    font-size 1rem

</style>
