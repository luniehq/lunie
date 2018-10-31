<template lang='pug'>
li.li-validator(:class='styles')
  router-link(:to="{ name: 'validator', params: { validator: validator.id }}")
    .li-validator__value.name
      img.avatar(v-if="validator.keybase" :src="validator.keybase.avatarUrl" width="48" height="48")
      img.avatar(v-else src="~assets/images/validator-icon.svg" width="48" height="48")
      .vert
        span.validator-profile__status(v-bind:class="statusColor" v-tooltip.top="status")
        .top {{ validator.description.moniker }}
        short-bech32(:address="validator.operator_address")
    .li-validator__value.your-votes
      span {{ yourVotes.isLessThan(0.01) && yourVotes.isGreaterThan(0) ? '< ' + num.shortNumber(0.01) : num.shortNumber(yourVotes) }}
    .li-validator__value.your-rewards
      span n/a
    .li-validator__break: span
    .li-validator__value.percent_of_vote
      span {{ validator.percent_of_vote ? validator.percent_of_vote : `n/a` }}
    .li-validator__value.uptime
      // add .green .yellow or .red class to this span to trigger inidication by color
      span {{ uptime }}
    .li-validator__value.commission
      span {{ commission }}
    .li-validator__value.slashes
      // add .green .yellow or .red class to this span to trigger inidication by color
      span {{ slashes }}
</template>

<script>
import { mapGetters } from "vuex"
import num from "scripts/num"
import { calculateTokens, ratToBigNumber } from "scripts/common"
import ShortBech32 from "common/ShortBech32"
import BigNumber from "bignumber.js"
export default {
  name: `li-validator`,
  props: [`validator`, `disabled`],
  components: {
    ShortBech32
  },
  computed: {
    ...mapGetters([`delegates`, `committedDelegations`]),
    slashes() {
      return `n/a` //TODO: add slashes
    },
    commission() {
      return `${this.num.pretty(this.validator.commission.rate)}%`
    },
    uptime() {
      let rollingWindow = 10000 // param of slashing period
      let info = this.validator.signing_info
      if (info) {
        // uptime in the past 10k blocks
        let uptimeRollingWindow = info.signed_blocks_counter / rollingWindow
        return `${this.num.pretty(uptimeRollingWindow * 100)}%`
      }
      return `n/a`
    },
    // TODO uncomment when distribution is done
    // yourRewards() {
    //   if (
    //     this.committedDelegations[this.validator.id] &&
    //     this.committedDelegations[this.validator.id].isValidator &&
    //     this.validator.proposer_reward_pool > 0
    //   ) {
    //     let myShares = calculateShares(
    //       this.validator,
    //       this.committedDelegations[this.validator.id]
    //     )
    //     let shareRatio = myShares.div(parseValidatorShares(this.validator))
    //     let rewardsInShares = shareRatio.times(
    //       this.validator.proposer_reward_pool
    //     )
    //     let rewardsInTokens = calculateTokens(rewardsInShares)
    //     return this.num.full(rewardsInTokens).toString()
    //   } else return "0"
    // },
    yourVotes() {
      return this.committedDelegations[this.validator.id]
        ? calculateTokens(
            this.validator,
            this.committedDelegations[this.validator.id]
          )
        : BigNumber(0)
    },
    styles() {
      let value = ``
      if (this.validator.isValidator) value += `li-validator-validator `
      return value
    },
    delegateType() {
      return this.validator.revoked
        ? `Revoked`
        : this.validator.isValidator
          ? `Validator`
          : `Candidate`
    },
    powerRatio() {
      return ratToBigNumber(this.validator.tokens)
        .div(this.delegates.globalPower)
        .toNumber()
    },
    // TODO enable once we decide on limits
    // powerRatioLevel() {
    //   if (this.powerRatio < 0.01) return "green"
    //   if (this.powerRatio < 0.03) return "yellow"
    //   else if (this.powerRatio >= 0.03) return "red"
    // },
    status() {
      // status: jailed
      if (this.validator.revoked)
        return `This validator has been jailed and is not currently validating`

      // status: candidate
      if (parseFloat(this.validator.voting_power) === 0)
        return `This validator has declared candidacy but does not have enough voting power yet`

      // status: validator
      return `This validator is actively validating`
    },
    statusColor() {
      // status: jailed
      if (this.validator.revoked) return `red`

      // status: candidate
      if (parseFloat(this.validator.voting_power) === 0) return `yellow`

      // status: validator
      return `green`
    }
  },
  data: () => ({ num })
}
</script>

<style lang="stylus">
@require '~variables'

.li-validator
  margin 0.5rem 0rem 0.5rem 2rem
  width 100%

.li-validator a
  display flex
  align-items center
  padding 1rem
  background-color var(--app-fg)
  border-radius 0.25rem
  border 1px solid var(--bc-dim)

  &:hover
    background var(--hover-bg)

  .li-validator__value:not(:first-of-type) span
    color var(--dim)
    background-color var(--white-fade-1)
    border 1px solid var(--white-fade-2)
    border-radius 4px
    display block
    width 100%
    margin 0 0.5rem
    font-size sm
    line-height sm
    text-align right
    padding 0.25rem 0.5rem

    &.red
      background-color rgba(209, 2, 0, 0.15)
      border solid 0.5px rgba(209, 2, 0, 0.25)
      color #ff0200

    &.yellow
      background-color rgba(255, 149, 2, 0.15)
      border solid 0.5px rgba(255, 149, 2, 0.25)
      color #ff9502

    &.green
      background-color rgba(46, 164, 45, 0.15)
      border solid 0.5px rgba(46, 164, 45, 0.25)
      color #2ea42d

  .li-validator__break
    flex 0
    display flex
    align-items center
    min-width 1

    span
      margin 0 0.5rem
      width 1px
      background-color var(--white-fade-1)
      height 2rem

  .li-validator__value
    flex 1
    display flex
    align-items center
    min-width 0

    &.name
      flex 3

      a
        display flex

        img
          border-radius 100%
          margin-right 1rem

  .vert
    display flex
    flex-direction column
    color var(--bright)
    margin-left 1rem
    padding-left 1rem
    position relative

    .top
      padding-bottom 0.5rem
      line-height 1rem
      font-size 1rem
      font-weight 500

    .validator-profile__status
      left 0
      top 5px

    .bottom
      font-size sm
      line-height sm
      color var(--dim)

  .li-validator__icon
    width 1.5rem
    display flex
    align-items center
    justify-content center

    img, span
      height 1rem
      width 1rem

    &.bar
      position relative

      span
        display block
        position absolute
        top 0
        left 0
        z-index z(listItem)
        line-height 3rem
        color var(--txt)

      .bar
        height 1.5rem
        position relative
        left -0.25rem
        background var(--accent-alpha)

    &.checkbox
      justify-content center
      cursor pointer

    span
      white-space nowrap
      overflow hidden
      text-overflow ellipsis
      padding-right 1rem

ol
  list-style none
  counter-reset counter

ol li
  counter-increment counter
  position relative
  height 82px

ol li:before
  content counter(counter) ''
  color var(--dim)
  font-size sm
  position absolute
  display block
  left -1.5rem
  line-height 82px
  height 100%
</style>
