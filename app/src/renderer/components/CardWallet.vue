<template>
  <div class="card-wallet">
    <div class="card-wallet-container" v-if="walletValue.expanded">
      <header>
        <div class="left">
          <div class="title">Wallet <span>{{ capitalize(walletKey) }}</span></div>
        </div>
        <div class="chain-id">{{ walletValue.chainId }}</span></div>
        <a class="window-size" @click="setExpanded(false)">
          <i class="fa fa-window-minimize"></i>
        </a>
      </header>
      <div class="balances">
        <div class="balance" v-for="coin in walletValue.coins">
          <div class="value">
            <span class="integer">{{ integerize(coin.amount) }}</span><span class="fraction">{{ fractionize(coin.amount) }}</span>
          </div>
          <div class="unit">{{ coin.denom.toUpperCase() }}</div>
        </div>
      </div>
    </div>

    <div class="card-wallet-container minimized" v-else>
      <header>
        <div class="left">
          <div class="title">Wallet <span>{{ capitalize(walletKey) }}</span></div>
          <div class="balances-header">
            <div class="balance" v-for="coin in walletValue.coins">
              <div class="value">
            <span class="integer">{{ integerize(coin.amount) }}</span><span class="fraction">{{ fractionize(coin.amount) }}</span>
</div>
              <div class="unit">{{ coin.denom.toUpperCase() }}</div>
            </div>
          </div>
        </div>
        <div class="chain-id">{{ walletValue.chainId }}</span></div>
        <a class="window-size" @click="setExpanded(true)">
          <i class="fa fa-window-maximize"></i>
        </a>
      </header>
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
  padding 0.25rem

  .card-wallet-container
    background c-app-fg
    padding 0.25rem
    
    header
      padding 0.25em 0.5em
      display flex
      align-items center

      .left
        flex 1
        display flex
        overflow hidden
      
      .title
        font-weight 500
        margin-right 0.5rem
        span
          color light
          mono()

      .balances-header
        display flex
        flex 1
        padding 0 0.25rem
        margin 0 0.5rem
        background lighten(c-app-bg, 50%)
        overflow hidden
        .balance
          display flex
          align-items flex-end
          margin 0 0.25rem
          &:after
            content '/'
            color lighten(light, 50%)
            display inline-block
            margin-left 0.5rem
            text-align center

          &:last-of-type:after
            display none

          .value
            margin-right 0.25rem
            .fraction
              color dim
          .unit
            color light

      .chain-id
        color light
        margin 0 0.5rem

      .window-size
        margin-left 0.5rem
        background c-app-bg
        height 1.5rem
        width 1.5rem

        display flex
        justify-content center
        align-items center

        font-size 0.875rem
        color light

    &.minimized
      padding 0.75rem

  .balances
    display flex
    flex-flow row wrap
    padding 0.125rem

    .balance
      flex 0 0 25%
      max-width 12rem
      padding 1rem
      background lighten(c-app-bg, 50%)
      border 0.125rem solid c-app-fg

      min-width 0
      overflow hidden
      text-overflow ellipsis
      white-space nowrap

      .value, .unit
        line-height 1

      .value
        font-size 1.5rem
        font-weight 300
        margin-bottom 0.5rem
        .integer
          font-weight 400

        .fraction
          color dim

      .unit
        color light
</style>
