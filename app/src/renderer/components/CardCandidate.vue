<template lang="pug">
transition(name='ts-card-candidate'): div(:class='cssClass')
  .card-candidate-container
    .values
      .value.id
        span
          i.fa.fa-check-square-o(v-if='inCart' @click='rm(candidate.id)')
          i.fa.fa-square-o(v-else @click='add(candidate.id)')
          router-link(:to="{ name: 'candidate', params: { candidate: candidate.id } }")
            | {{ candidate.id }}
      .value.atoms.num.bar
        span {{ num.prettyInt(candidate.computed.atoms) }}
        .bar(:style='barCss')
      .value.delegators.num
        span
          i.fa.fa-user
          |  {{ num.prettyInt(candidate.computed.delegators) }}
    menu
      btn(theme='cosmos' v-if='inCart' icon='times' value='Remove' size='sm' @click.native='rm(candidate.id)')
      btn(v-else='', theme='cosmos', icon='check', value='Add', size='sm', @click.native='add(candidate.id)')
</template>

<script>
import { mapGetters } from 'vuex'
import num from '../scripts/num'
import Btn from '@nylira/vue-button'
import { maxBy } from 'lodash'
export default {
  name: 'card-candidate',
  props: ['candidate'],
  components: {
    Btn
  },
  computed: {
    ...mapGetters(['shoppingCart', 'candidates']),
    cssClass () {
      let value = 'card-candidate'
      if (this.inCart) value += ' card-candidate-active '
      return value
    },
    maxAtoms () {
      if (this.candidates) {
        let richestCandidate = maxBy(this.candidates, 'computed.atoms')
        return richestCandidate.computed.atoms
      }
      return 0
    },
    barCss () {
      let percentage = Math.round((this.candidate.computed.atoms / this.maxAtoms) * 100)
      return {
        width: percentage + '%'
      }
    },
    inCart () {
      return this.shoppingCart.find(c => c.candidateId === this.candidate.id)
    }
  },
  data: () => ({
    num: num
  }),
  methods: {
    add (candidateId) {
      this.$store.commit('addToCart', candidateId)
    },
    rm (candidateId) {
      this.$store.commit('removeFromCart', candidateId)
    }
  }
}
</script>

<style lang="stylus">
@require '../styles/variables.styl'
.card-candidate
  &:nth-of-type(2n) .card-candidate-container
    background alpha(c-app-fg, 20%)

  &.card-candidate-active .card-candidate-container
    .value.id a, .icon
      color hsl(mhue,75%,50%)

.card-candidate-container
  position relative

  .values
    display flex
    height 2em

  .value
    flex 1
    display flex
    align-items center
    justify-content space-between

    color dim

    &.id
      i.fa
        margin-right 0.5rem
      a
        color txt
        &:hover
          color bright
    &.num
      mono()
      font-size 0.875rem

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
        border-right 4px solid lighten(c-app-fg, 4%)
        background alpha(c-app-fg, 75%)
        margin-right 1rem

    span
      display block
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

/* transition */
.ts-card-candidate-enter-active, .ts-card-candidate-leave-active
  transition all 0.5s ease
  height 2rem
  opacity 1

.ts-card-candidate-enter, .ts-card-candidate-leave-to
  height 0
  opacity 0

.ts-card-candidate-enter
  background link
</style>
