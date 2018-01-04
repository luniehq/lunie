<template lang='pug'>
.li-delegate(:class='styles'): .li-delegate__values
  .li-delegate__value.checkbox
    input(type="checkbox" v-model="inCart" @click="toggleSelected(delegate)")
  .li-delegate__value.name
    span
      router-link(v-if="config.devMode" :to="{ name: 'delegate', params: { delegate: delegate.id }}")
        | {{ ' ' + delegate.moniker }}
      a(v-else) {{ ' ' + delegate.moniker }}
  .li-delegate__value.id
    span {{ delegate.id }}
  .li-delegate__value.delegated
    span {{ num.percentInt(bondedPercent) }}
  .li-delegate__value.voting_power.num.bar
    span {{ num.prettyInt(delegate.voting_power) }}
    .bar(:style='vpStyles')
  .li-delegate__value
    span {{ num.prettyInt(amountBonded(delegate.id)) }}
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
    ...mapGetters(['shoppingCart', 'delegates', 'config', 'committedDelegations']),
    styles () {
      let value = ''
      if (this.inCart) value += 'li-delegate-active '
      return value
    },
    vpMax () {
      if (this.delegates.length > 0) {
        let richestDelegate = maxBy(this.delegates, 'voting_power')
        return richestDelegate.voting_power
      } else { return 0 }
    },
    vpTotal () {
      return this.delegates
        .slice()
        .sort((a, b) => b.voting_power - a.voting_power)
        .slice(0, 100)
        .reduce((sum, v) => sum + v.voting_power, 0)
    },
    vpStyles () {
      let percentage = Math.round((this.delegate.voting_power / this.vpMax) * 100)
      return { width: percentage + '%' }
    },
    bondedPercent () {
      return this.delegate.voting_power / this.vpTotal
    },
    inCart () {
      return this.shoppingCart.find(c => c.id === this.delegate.id)
    }
  },
  data: () => ({
    num: num
  }),
  methods: {
    toggleSelected (delegate) {
      if (this.inCart) {
        this.$store.commit('removeFromCart', delegate.id)
      } else {
        this.$store.commit('addToCart', delegate)
      }
    },
    amountBonded (delegateId) {
      return this.committedDelegations[delegateId]
    }
  }
}
</script>

<style lang="stylus">
@require '~variables'

.li-delegate
  &:nth-of-type(2n-1)
    background app-fg
  &.li-delegate-active
    .li-delegate__value i.fa
      color accent

.li-delegate__values
  display flex
  height 3rem

.li-delegate__value
  flex 3
  display flex
  align-items center
  min-width 0

  &:first-child
    flex 1

  &.id span
    i.fa
      margin-right 0.25rem

  &.bar
    position relative
    span
      display block
      position absolute
      top 0
      left 0
      z-index z(listItem)

      line-height 3rem
      color txt

    .bar
      height 1.5rem
      background alpha(accent, 33.3%)

  &.checkbox
    justify-content center

  span
    white-space nowrap
    overflow hidden
    text-overflow ellipsis
    padding 0 0.25rem
</style>
