<template lang='pug'>
transition(name='ts-li-delegate'): div(:class='styles')
  .li-delegate-container
    .values
      .value.id
        span
          template
            i.fa.fa-check-square-o(v-if='inCart' @click='rm(delegate)')
            i.fa.fa-square-o(v-else @click='add(delegate)')
          router-link(v-if="config.devMode" :to="{ name: 'delegate', params: { delegate: delegate.id }}")
            | {{ delegate.id }}
          a(v-else) {{ delegate.id }}
      .value {{ delegate.country ? delegate.country : 'n/a' }}
      .value.voting_power.num.bar
        span {{ num.prettyInt(delegate.voting_power) }}
        .bar(:style='vpStyles')
      .value.delegated
        span {{ num.percentInt(bondedPercent) }}
      .value {{ delegate.commission ? num.percentInt(delegate.commission) : 'n/a' }}
    menu
      btn(v-if='inCart'
        icon='delete' value='Remove' size='sm' @click.native='rm(delegate)')
      btn(v-else
        icon='check' value='Add' size='sm' @click.native='add(delegate)')
</template>

<script>
import { mapGetters } from 'vuex'
import num from 'scripts/num'
import Btn from '@nylira/vue-button'
import { maxBy } from 'lodash'
export default {
  name: 'li-delegate',
  props: ['delegate'],
  components: {
    Btn
  },
  computed: {
    ...mapGetters(['shoppingCart', 'delegates', 'config']),
    styles () {
      let value = 'li-delegate'
      if (this.inCart) value += ' li-delegate-active '
      return value
    },
    vpMax () {
      if (this.delegates.length > 0) {
        let richestDelegate = maxBy(this.delegates, 'voting_power')
        return richestDelegate.voting_power
      } else { return 0 }
    },
    vpStyles () {
      let percentage =
        Math.round((this.delegate.voting_power / this.vpMax) * 100)
      return { width: percentage + '%' }
    },
    bondedPercent () {
      return this.delegate.shares / this.delegate.voting_power
    },
    inCart () {
      return this.shoppingCart.find(c => c.id === this.delegate.id)
    }
  },
  data: () => ({
    num: num
  }),
  methods: {
    add (delegate) { this.$store.commit('addToCart', delegate) },
    rm (delegate) { this.$store.commit('removeFromCart', delegate.id) }
  }
}
</script>

<style lang="stylus">
@require '~variables'

.li-delegate
  &:nth-of-type(2n) .li-delegate-container
    background app-fg

  &.li-delegate-active .li-delegate-container
    .value.id a, .icon
      color link

.li-delegate-container
  position relative
  &:hover
    menu
      display block

  .values
    display flex
    height 2rem
    padding 0 0.75rem

  .value
    flex 1
    display flex
    align-items center
    justify-content space-between

    padding 0 0.25rem

    min-width 0

    &.id
      i.fa
        margin-right 0.5rem
      a
        color link
        &:hover
          color hover

    &.bar
      position relative
      span
        display block
        position absolute
        top 0
        left 0
        z-index 10

        line-height 2rem
        padding 0 0.375rem
        color txt

      .bar
        height 1.5rem
        background alpha(link, 33.3%)

      &.delegated .bar
        background alpha(accent, 33.3%)

    span
      display block

      white-space nowrap
      text-overflow ellipsis
      overflow hidden
      i.fa
        color dim

  menu
    position absolute
    top 0
    right 0
    height 2rem
    display flex
    align-items center
    justify-content center
    display none

@media screen and (max-width: 414px)
  .li-delegate-container menu .ni-btn .ni-btn-value
    display none

@media screen and (max-width: 479px)
  .li-delegate-container .value span i.fa
    display none

@media screen and (min-width: 768px)
  .li-delegate-container
    .value span
      font-size x
</style>
