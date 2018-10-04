<template lang="pug">
  div
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
                | Inflation Rate Change
                |
                i.material-icons.info-button(v-tooltip.top="paramsTooltips.inflation_rate_change") info_outline
              dd {{ parameters.inflation_rate_change ? parameters.inflation_rate_change : `n/a` }}
            dl.info_dl
              dt Minimum Inflation Rate
              dd {{ parameters.inflation_min ? parameters.inflation_min : `n/a` }}
            dl.info_dl
              dt Maximum Inflation Rate
              dd {{ parameters.inflation_max ? parameters.inflation_max : `n/a` }}
            dl.info_dl
              dt Goal for bonded {{ bondingDenom }}s
              dd {{ parameters.goal_bonded ? parameters.goal_bonded : `n/a` }}
          .column
            dl.info_dl
              dt
                | Unbonding time
                |
                i.material-icons.info-button(v-tooltip.top="paramsTooltips.unbonding_time") info_outline
              dd {{ parameters.unbonding_time ? parameters.unbonding_time : `n/a` }}
            dl.info_dl
              dt Max number of Validators
              dd {{ parameters.max_validators ? parameters.max_validators : `n/a` }}
            dl.info_dl
              dt Bondable coin denomination
              dd {{ parameters.bond_denom ? parameters.bond_denom : `n/a` }}
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
                | Inflation
                |
                i.material-icons.info-button(v-tooltip.top="poolTooltips.inflation") info_outline
              dd {{ pool.inflation ? pool.inflation : `n/a` }}
            dl.info_dl
              dt
                | Inflation last block
                |
                i.material-icons.info-button(v-tooltip.top="poolTooltips.inflation_last_time") info_outline
              dd {{ pool.inflation_last_time ? pool.inflation_last_time : `n/a` }}
            dl.info_dl
              dt
                | Date of last commission reset
                |
                i.material-icons.info-button(v-tooltip.top="poolTooltips.date_last_commission_reset") info_outline
              dd {{ pool.date_last_commission_reset ? timeAgo(pool.date_last_commission_reset) : `n/a` }}
          .column
            dl.info_dl
              dt
                | Loose {{ bondingDenom }}
                |
                i.material-icons.info-button(v-tooltip.top="poolTooltips.loose_tokens") info_outline
              dd {{ pool.loose_tokens ? pool.loose_tokens : `n/a` }}
            dl.info_dl
              dt
                | Bonded {{ bondingDenom }}
                |
                i.material-icons.info-button(v-tooltip.top="poolTooltips.bonded_tokens") info_outline
              dd {{ pool.bonded_tokens ? pool.bonded_tokens : `n/a` }}
            dl.info_dl
              dt
                | Previous bonded shares
                |
                i.material-icons.info-button(v-tooltip.top="poolTooltips.prev_bonded_shares") info_outline
              dd {{ pool.prev_bonded_shares ? pool.prev_bonded_shares : `n/a` }}
</template>

<script>
import moment from "moment"
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
      inflation_rate_change: `maximum annual change in inflation rate`,
      inflation_max: `maximum inflation rate`,
      inflation_min: `minimum inflation rate`,
      goal_bonded: `goal of percent bonded atoms`,
      unbonding_time: `time to complete an unbonding delegetion and claim bonds`,
      max_validators: `maximum number of validators for the chain`,
      bond_denom: `bondable coin denomination`
    },
    poolTooltips: {
      description: `The staking pool represents the dynamic parameters of the current state`,
      loose_tokens: `tokens which are not bonded in a validator`,
      bonded_tokens: `reserve of bonded tokens`,
      inflation_last_time: `block which the last inflation was processed`,
      inflation: `current annual inflation rate`,
      date_last_commission_reset: `UNIX timestamp for last commission accounting reset (daily)`,
      prev_bonded_shares: `last recorded bonded shares; used for fee calculations`
    }
  }),
  computed: {
    ...mapGetters([
      `bondingDenom`,
      `config`,
      `user`,
      `parameters`,
      `pool`,
      `connected`
    ])
  },
  methods: {
    timeAgo(date) {
      return moment(date, `x`).fromNow()
    },
    getStakingParameters() {
      this.$store.dispatch(`getParameters`)
    },
    getStakingPool() {
      this.$store.dispatch(`getPool`)
    }
  },
  async mounted() {
    this.getStakingParameters()
    this.getStakingPool()
  }
}
</script>
<style lang="stylus">
@require '~variables'

@media screen and (min-width: 640px)
  #parameters .tm-part-main
    display flex
    flex-flow row-reverse nowrap

    .list-items
      flex 1

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
    border solid 1px #31354e
    border-radius 2px
    font-size 1rem
    line-height 1rem
    padding 0.5rem

    &.info_dl__text-box
      min-height 6.91rem

@media screen and (min-width: 768px)
  padding-bottom 4rem

@media screen and (min-width: 1024px)
  .fixed-button-bar
    margin-left width-side
</style>
