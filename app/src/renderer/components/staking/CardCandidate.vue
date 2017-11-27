<template lang='pug'>
transition(name='ts-card-candidate'): div(:class='cssClass')
  .card-candidate-container
    .values
      .value.id
        span
          template(v-if='signedIn')
            i.fa.fa-check-square-o(v-if='inCart' @click='rm(candidate)')
            i.fa.fa-square-o(v-else @click='add(candidate)')
          router-link(:to="{ name: 'candidate', params: { candidate: candidate.id }}")
            | {{ candidate.pubkey.data }}
      .value.atoms.num.bar
        span {{ num.prettyInt(candidate.voting_power) }}
        .bar(:style='atomsCss')
      .value.atoms.num.bar.delegated(v-if='signedIn')
        span {{ num.prettyInt(candidate.delegatedCoins) }}
        .bar(:style='delegatedAtomsCss')
      .value.shares.num
        span
          i.fa.pie-chart
          |  {{ num.prettyInt(candidate.shares) }}
    menu(v-if='signedIn')
      btn(theme='cosmos' v-if='inCart'
        icon='times' value='Remove' size='sm' @click.native='rm(candidate)')
      btn(v-else='' theme='cosmos'
        icon='check' value='Add' size='sm' @click.native='add(candidate)')
</template>

<script>
import { mapGetters } from 'vuex'
import num from '../../scripts/num'
import Btn from '@nylira/vue-button'
// import { maxBy } from 'lodash'
export default {
  name: 'card-candidate',
  props: ['candidate'],
  components: {
    Btn
  },
  computed: {
    ...mapGetters(['shoppingCart', 'candidates', 'user']),
    cssClass () {
      let value = 'card-candidate'
      if (this.inCart) value += ' card-candidate-active '
      return value
    },
    signedIn () {
      return this.user.signedIn
    },
    maxAtoms () {
      // if (this.candidates.length > 0) {
      //   let richestCandidate = maxBy(this.candidates, 'atoms')
      //   return richestCandidate.atoms
      // } else { return 0 }
      return 0
    },
    atomsCss () {
      let percentage = Math.round((this.candidate.atoms / this.maxAtoms) * 100)
      return { width: percentage + '%' }
    },
    maxDelegatedAtoms () {
      // if (this.candidates) {
      //   let richestCandidate = maxBy(this.candidates, 'computed.delegatedAtoms')
      //   return richestCandidate.computed.delegatedAtoms
      // } else { return 0 }
      return 0
    },
    delegatedAtomsCss () {
      let percentage = Math.round((this.candidate.delegatedAtoms /
        this.maxDelegatedAtoms) * 100)
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
    add (candidate) {
      this.$store.commit('addToCart', candidate)
    },
    rm (candidate) {
      this.$store.commit('removeFromCart', candidate.id)
    }
  }
}
</script>

<style lang="stylus">
@require '../../styles/variables.styl'
.card-candidate
  &:nth-of-type(2n) .card-candidate-container
    background alpha(app-fg, 7.5%)

  &.card-candidate-active .card-candidate-container
    .value.id a, .icon
      color hsl(mhue,75%,50%)

.card-candidate-container
  position relative

  .values
    display flex
    height 2em
    padding 0 0.75rem

  .value
    flex 1
    display flex
    align-items center
    justify-content space-between

    color dim
    padding 0 0.25rem
    font-size 0.75rem

    min-width 0

    &.id
      i.fa
        margin-right 0.5rem
      a
        color txt
        &:hover
          color bright
    &.num
      mono()

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

      .bar
        height 1.5rem
        background alpha(app-fg, 75%)
        margin-right 1rem
      &.delegated
        span
          color light
        .bar
          background alpha(app-fg, 50%)

    span
      display block

      white-space nowrap
      text-overflow ellipsis
      overflow hidden
      i.fa
        color light

  menu
    position absolute
    top 0
    right 0
    height 2rem
    display flex
    align-items center
    justify-content center

@media screen and (max-width: 414px)
  .card-candidate-container menu .ni-btn .ni-btn-value
    display none

@media screen and (max-width: 479px)
  .card-candidate-container .value span i.fa
    display none
@media screen and (min-width: 768px)
  .card-candidate-container
    .value span
      font-size 1rem

</style>
