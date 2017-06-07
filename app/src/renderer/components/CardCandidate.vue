<template>
  <transition name="ts-card-candidate">
  <div class="card-candidate">
    <div class="card-candidate-container">
      <div class="values">
        <div class="value id">
          <span>
            <router-link
              :to="{ name: 'candidate', params: { candidate: candidate.id } }">
              {{ candidate.id }}
              </router-link>
          </span>
        </div>
        <div class="value atoms num bar">
          <span>{{ num.prettyInt(candidate.atoms) }}</span>
          <div class="bar" :style="barCss"></div>
        </div>
        <div class="value delegators num">
          <span>
            <i class="fa fa-user"></i>
            {{ num.prettyInt(candidate.delegators) }}
          </span>
        </div>
      </div>
      <menu>
        <btn
          theme="cosmos"
          v-if="myStake.candidateId === candidate.id"
          icon="times"
          value="Undo Stake"
          size="sm"
          @click.native="unstake">
        </btn>
        <btn
          v-else
          theme="cosmos"
          icon="check"
          value="Stake"
          size="sm"
          @click.native="stake(candidate.id)">
        </btn>
      </menu>
    </div>
  </div>
  </transition>
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
    ...mapGetters(['myStake', 'candidates']),
    maxAtoms () {
      if (this.candidates) {
        let richestCandidate = maxBy(this.candidates, 'atoms')
        return richestCandidate.atoms
      }
      return 0
    },
    barCss () {
      let percentage = Math.round((this.candidate.atoms / this.maxAtoms) * 100)
      return {
        width: percentage + '%'
      }
    }
  },
  data: () => ({
    num: num
  }),
  methods: {
    stake (candidateId) {
      this.$store.commit('stake', candidateId)
    },
    unstake () {
      this.$store.commit('unstake')
    }
  }
}
</script>

<style lang="stylus">
@require '../styles/variables.styl'
.card-candidate
  &:nth-of-type(2n) .card-candidate-container
    background alpha(c-app-fg, 20%)

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
