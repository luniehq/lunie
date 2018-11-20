<template lang="pug">
li.li-coin
  .li-coin__icon
    img(src="../../assets/images/cosmos-logo.png")
  .li-coin__content
    .li-coin__content__left__denom
        p.coin-denom {{ this.denomination }}

    .li-coin__content__left__amount
        p.coin-amount {{ this.amount }}

    router-link(:to="{ name: 'send', params: { denom: coin.denom }}")
      tm-btn.sendTx-btn(
        value="Send"
        icon="chevron_right"
        icon-pos="right"
        color="primary")
</template>

<script>
import num from "scripts/num"
import { TmBtn } from "@tendermint/ui"
export default {
  name: `li-coin`,
  components: {
    TmBtn
  },
  props: {
    coin: {
      type: Object,
      required: true
    }
  },
  data: () => ({ num }),
  computed: {
    amount() {
      return num.full(parseFloat(this.coin.amount))
    },
    denomination() {
      return (
        this.coin.denom.substring(0, 1).toUpperCase() +
        this.coin.denom.substring(1).toLowerCase()
      )
    }
  }
}
</script>

<style lang="stylus">
@require "~variables"

.li-coin
  display flex
  align-items center
  font-size m
  margin-bottom 0.5rem
  border 1px solid var(--bc-dim)
  background var(--app-fg)
  min-width 45rem

  &:hover
    background var(--hover-bg)

  b
    font-weight 500

  &__icon
    padding 12px 0 12px 1rem

    img
      max-height 100%
      max-width 52px
      border 0.5px solid
      border-radius 50%
      display block

  &__content
    display flex
    flex-direction row
    width 100%
    padding 1rem
    font-size m

    &__left
      display flex
      flex-direction column

      &__amount, &__denom
        flex 0.5
        vertical-align middle
        font-size lg
        color var(--bright)
</style>
