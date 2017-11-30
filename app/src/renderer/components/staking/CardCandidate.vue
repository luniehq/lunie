<template lang='pug'>
transition(name='ts-card-candidate'): div(:class='styles')
  .card-candidate-container
    .values
      .value.id
        span
          template
            i.fa.fa-check-square-o(v-if='inCart' @click='rm(candidate)')
            i.fa.fa-square-o(v-else @click='add(candidate)')
          router-link(:to="{ name: 'candidate', params: { candidate: candidate.id }}")
            | {{ candidate.keybaseID}}
      .value.voting_power.num.bar
        span {{ num.prettyInt(candidate.voting_power) }}
        .bar(:style='vpStyles')
      .value.delegated.num.bar.delegated
        span {{ num.prettyInt(candidate.shares) }}
        .bar(:style='sharesStyles')
    menu
      btn(theme='cosmos' v-if='inCart'
        icon='delete' value='Remove' size='sm' @click.native='rm(candidate)')
      btn(v-else='' theme='cosmos'
        icon='check' value='Add' size='sm' @click.native='add(candidate)')
</template>

<script>
import { mapGetters } from 'vuex'
import num from 'scripts/num'
import Btn from '@nylira/vue-button'
import { maxBy } from 'lodash'
export default {
  name: 'card-candidate',
  props: ['candidate'],
  components: {
    Btn
  },
  computed: {
    ...mapGetters(['shoppingCart', 'candidates', 'user']),
    styles () {
      let value = 'card-candidate'
      if (this.inCart) value += ' card-candidate-active '
      return value
    },
    vpMax () {
      if (this.candidates.length > 0) {
        let richestCandidate = maxBy(this.candidates, 'voting_power')
        return richestCandidate.voting_power
      } else { return 0 }
      return 0
    },
    vpStyles () {
      let percentage =
        Math.round((this.candidate.voting_power / this.vpMax) * 100)
      return { width: percentage + '%' }
    },
    sharesMax () {
      if (this.candidates) {
        let richestCandidate = maxBy(this.candidates, 'shares')
        return richestCandidate.shares
      } else { return 0 }
    },
    sharesStyles () {
      let percentage =
        Math.round((this.candidate.shares / this.sharesMax) * 100)
      return { width: percentage + '%' }
    },
    inCart () {
      return this.shoppingCart.find(c => c.id === this.candidate.id)
    }
  },
  data: () => ({
    num: num
  }),
  methods: {
    add (candidate) { this.$store.commit('addToCart', candidate) },
    rm (candidate) { this.$store.commit('removeFromCart', candidate.id) }
  }
}
</script>

<style lang="stylus">
@require '~variables'

.card-candidate
  &:nth-of-type(2n) .card-candidate-container
    background app-fg

  &.card-candidate-active .card-candidate-container
    .value.id a, .icon
      color link

.card-candidate-container
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

    color dim
    padding 0 0.25rem
    font-size sm

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
  .card-candidate-container menu .ni-btn .ni-btn-value
    display none

@media screen and (max-width: 479px)
  .card-candidate-container .value span i.fa
    display none

@media screen and (min-width: 768px)
  .card-candidate-container
    .value span
      font-size x
</style>
