<template lang='pug'>
.li-validator(:class='styles'): .li-validator__values
  .li-validator__value.name
    router-link(:to="{ name: 'validator', params: { validator: delegate.id }}")
      span.validator-profile__status(v-bind:class="statusColor" v-tooltip.top="status")
      img.avatar(v-if="delegate.keybase" :src="delegate.keybase.avatarUrl" width="48" height="48")
      img.avatar(v-else src="~assets/images/validator-icon.svg" width="48" height="48")
      .vert
        .top {{ delegate.description.moniker }}
        .bottom {{ shortAddress(delegate.id)}}
  .li-validator__value.your-votes
    span {{ yourVotes }}
  .li-validator__value.your-rewards
    span n/a
  .li-validator__break: span
  .li-validator__value.percent_of_vote
    span {{ delegate.percent_of_vote ? delegate.percent_of_vote : `n/a` }}
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
import { shortAddress, calculateTokens, ratToBigNumber } from "scripts/common"
export default {
  name: "li-validator",
  props: ["delegate", "disabled"],
  computed: {
    ...mapGetters([
      "lastHeader",
      "shoppingCart",
      "delegates",
      "config",
      "committedDelegations",
      "user"
    ]),
    slashes() {
      return "n/a" //TODO: add slashes
    },
    commission() {
      return `${this.num.pretty(this.delegate.commission)}%`
    },
    uptime() {
      let rollingWindow = 10000 // param of slashing period
      let info = this.delegate.signing_info
      if (info) {
        // uptime in the past 10k blocks
        let uptimeRollingWindow = info.signed_blocks_counter / rollingWindow
        return `${this.num.pretty(uptimeRollingWindow * 100)}%`
      }
      return "n/a"
    },
    // TODO uncomment when distribution is done
    // yourRewards() {
    //   if (
    //     this.committedDelegations[this.delegate.id] &&
    //     this.committedDelegations[this.delegate.id].isValidator &&
    //     this.delegate.proposer_reward_pool > 0
    //   ) {
    //     let myShares = calculateShares(
    //       this.delegate,
    //       this.committedDelegations[this.delegate.id]
    //     )
    //     let shareRatio = myShares.div(parseValidatorShares(this.delegate))
    //     let rewardsInShares = shareRatio.times(
    //       this.delegate.proposer_reward_pool
    //     )
    //     let rewardsInTokens = calculateTokens(rewardsInShares)
    //     return this.num.pretty(rewardsInTokens).toString()
    //   } else return "0"
    // },
    yourVotes() {
      return this.num.pretty(
        this.committedDelegations[this.delegate.id]
          ? calculateTokens(
              this.delegate,
              this.committedDelegations[this.delegate.id]
            ).toString()
          : "0"
      )
    },
    styles() {
      let value = ""
      if (this.inCart || this.yourVotes > 0) value += "li-validator-active "
      if (this.delegate.isValidator) value += "li-validator-validator "
      return value
    },
    inCart() {
      return this.shoppingCart.find(c => c.id === this.delegate.id)
    },
    delegateType() {
      return this.delegate.revoked
        ? "Revoked"
        : this.delegate.isValidator
          ? "Validator"
          : "Candidate"
    },
    powerRatio() {
      return ratToBigNumber(this.delegate.tokens)
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
      if (this.delegate.revoked)
        return "This validator has been jailed and is not currently validating"

      // status: candidate
      if (parseFloat(this.delegate.voting_power) === 0)
        return "This validator has declared candidacy but does not have enough voting power yet"

      // status: validator
      return "This validator is actively validating"
    },
    statusColor() {
      // status: jailed
      if (this.delegate.revoked) return "red"

      // status: candidate
      if (parseFloat(this.delegate.voting_power) === 0) return "yellow"

      // status: validator
      return "green"
    }
  },
  data: () => ({ num, shortAddress })
}
</script>

<style lang="stylus">
@require '~variables'

.li-validator
  border 1px solid var(--bc)
  margin-bottom 1em

  &:nth-of-type(2n-1)
    background var(--app-fg)

  &.li-validator-active
    background var(--app-bg-alpha)

    .li-validator__value i
      color var(--link)

  &:hover
    background var(--hover-bg)

.li-validator__values
  display flex
  height 5rem
  padding 12px 1em
  background-color var(--app-nav)

  & > .li-validator__value:not(:first-of-type) span
    color var(--dim)
    background-color var(--white-fade-1)
    border 1px solid var(--white-fade-2)
    border-radius 4px
    display block
    width 100%
    margin 0 0.5em
    font-size h5
    line-height h5
    text-align right
    padding 4px 4px

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
    margin 0 0.5em
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
        margin-right 1em

      .vert
        display flex
        flex-direction column
        color var(--bright)

        .top
          font-size h5
          padding-bottom 6px

        .bottom
          font-size h6
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

.sort-by.name
  padding-left 1rem

.sort-by
  .label
    font-size sm
</style>
