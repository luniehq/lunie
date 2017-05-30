<template>
  <transition name="ts-card-validator">
  <div class="card-validator">
    <div class="card-validator-container">
      <div class="values">
        <div class="value id">
          <span>
            <router-link
              :to="{ name: 'validator', params: { validator: validator.id } }">
              {{ validator.id }}
              </router-link>
          </span>
        </div>
        <div class="value atoms num bar">
          <span>{{ num.prettyInt(validator.atoms) }}</span>
          <div class="bar" :style="barCss"></div>
        </div>
        <div class="value delegators num">
          <span>
            <i class="fa fa-user"></i>
            {{ num.prettyInt(validator.delegators) }}
          </span>
        </div>
      </div>
      <menu>
        <btn
          theme="cosmos"
          v-if="myStake.validatorId === validator.id"
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
          @click.native="stake(validator.id)">
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
  name: 'card-validator',
  props: ['validator'],
  components: {
    Btn
  },
  computed: {
    ...mapGetters(['myStake', 'validators']),
    maxAtoms () {
      if (this.validators) {
        let richestValidator = maxBy(this.validators, 'atoms')
        return richestValidator.atoms
      }
      return 0
    },
    barCss () {
      let percentage = Math.round((this.validator.atoms / this.maxAtoms) * 100)
      return {
        width: percentage + '%'
      }
    }
  },
  data: () => ({
    num: num
  }),
  methods: {
    stake (validatorId) {
      this.$store.commit('stake', validatorId)
    },
    unstake () {
      this.$store.commit('unstake')
    }
  }
}
</script>

<style lang="stylus">
@require '../styles/variables.styl'
.card-validator
  &:nth-of-type(2n) .card-validator-container
    background alpha(c-app-fg, 20%)

.card-validator-container
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
  .card-validator-container menu .ni-btn .ni-btn-value
    display none

@media screen and (max-width: 479px)
  .card-validator-container .value span i.fa
    display none

/* transition */
.ts-card-validator-enter-active, .ts-card-validator-leave-active
  transition all 0.5s ease
  height 2rem
  opacity 1

.ts-card-validator-enter, .ts-card-validator-leave-to
  height 0
  opacity 0

.ts-card-validator-enter
  background link
</style>
