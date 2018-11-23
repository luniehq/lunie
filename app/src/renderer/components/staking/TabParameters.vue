<template lang="pug">
  div(v-if="config.devMode")
    div
      h3
        | Staking Pool
        |
        i.material-icons.info-button(v-tooltip.top="poolTooltips.description") info_outline
      .parameters__details.parameters__section
        .row
          .column
            dl.info_dl
              dt
                | Loose {{ parameters.parameters.bond_denom }}
                |
                i.material-icons.info-button(v-tooltip.top="poolTooltips.loose_tokens") info_outline
              dd {{ this.pool.pool.loose_tokens ? pool.pool.loose_tokens : `n/a` }}
          .column
            dl.info_dl
              dt
                | Delegated {{ parameters.parameters.bond_denom }}
                |
                i.material-icons.info-button(v-tooltip.top="poolTooltips.bonded_tokens") info_outline
              dd {{ pool.pool.bonded_tokens ? pool.pool.bonded_tokens : `n/a` }}
    div
      h3
        | Staking Parameters
        |
        i.material-icons.info-button(v-tooltip.top="paramsTooltips.description") info_outline
      .parameters__details.parameters__section
        .row
          .column
            dl.info_dl
              dt
                | Unbonding Time
                |
                i.material-icons.info-button(v-tooltip.top="paramsTooltips.unbonding_time") info_outline
              dd {{ parameters.parameters.unbonding_time ? unbondingTimeInDays + ` days`: `n/a` }}
            dl.info_dl
              dt Current Staking Coin Denomination
              dd {{ parameters.parameters.bond_denom ? parameters.parameters.bond_denom : `n/a` }}
          .column
            dl.info_dl
              dt Maximum Number of Validators
              dd {{ parameters.parameters.max_validators ? parameters.parameters.max_validators : `n/a` }}
</template>

<script>
import { mapGetters } from "vuex"
import { TmBtn, TmListItem, TmPage, TmPart, TmToolBar } from "@tendermint/ui"
export default {
  name: `tab-staking-parameters`,
  components: {
    TmBtn,
    TmListItem,
    TmPage,
    TmPart,
    TmToolBar
  },
  data: () => ({
    paramsTooltips: {
      description: `Staking parameters define the high level settings for staking`,
      unbonding_time: `Time to complete an undelegation transaction and claim rewards`,
      max_validators: `Maximum number of validators in the validator set`,
      bond_denom: `The token being used for staking`
    },
    poolTooltips: {
      description: `The staking pool represents the dynamic parameters of the Cosmos Hub`,
      loose_tokens: `Total tokens which are not currently delegated to a validator`,
      bonded_tokens: `Total tokens which are currently delegated to a validator`
    }
  }),
  computed: {
    ...mapGetters([`config`, `parameters`, `pool`]),
    unbondingTimeInDays() {
      return (
        parseInt(this.parameters.parameters.unbonding_time) /
        (10 ** 9 * 60 * 60 * 24)
      )
    }
  },
  async mounted() {
    this.getStakingParameters()
    this.getStakingPool()
  },
  methods: {
    getStakingParameters() {
      this.$store.dispatch(`getParameters`)
    },
    getStakingPool() {
      this.$store.dispatch(`getPool`)
    }
  }
}
</script>
<style lang="stylus">
@require '~variables'

.parameters
  &__details
    > .row
      > .column
        flex 1

  &__section
    background-color var(--app-fg)
    display flex
    margin-bottom 1rem
    padding 2rem
    width 100%

h3
  margin 1em auto

.info-button
  color var(--link)

.column
  display flex
  flex-flow column
  position relative

.row
  display flex
  flex-direction row
  width 100%

.info_dl
  display flex
  flex-flow column
  margin-bottom 1.5rem
  margin-right 1rem

  dt
    color var(--dim)
    font-size small
    margin-bottom 4px

  dd
    border 1px solid var(--white-fade-2)
    border-radius 2px
    font-size 1rem
    line-height 1rem
    padding 0.5rem

    &.info_dl__text-box
      min-height 6.91rem
</style>
