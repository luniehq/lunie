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
        <!--
        <div class="value ip num">
          <span>{{ validator.ipAddress }}</span>
        </div>
        -->
        <div class="value atoms num">
          <span>{{ num.prettyInt(validator.atoms) }}</span>
        </div>
        <div class="value delegators num">
          <span>{{ num.prettyInt(validator.delegators) }}</span>
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
export default {
  name: 'card-validator',
  props: ['validator'],
  components: {
    Btn
  },
  computed: {
    ...mapGetters(['myStake'])
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
    background alpha(c-app-fg, 25%)

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
      font-weight 500
      a
        color txt
        &:hover
          color bright
    &.num
      mono()
      font-size 0.875rem

    span
      display block

  menu
    position absolute
    top 0
    right 0
    height 2rem
    display flex
    align-items center
    justify-content center

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
