<template lang="pug">
li.li-proposal
  router-link(:to="proposalLink")
    .li-proposal__value
      span.proposal-profile__status(v-bind:class="statusColor" v-tooltip.top="proposal.proposal_status")
      .vert
        .top.title {{ proposal.title }}
        span Status: {{ proposal.proposal_status }}
    .li-proposal__value.yes
      span {{ proposal.tally_result.yes }}
    .li-proposal__value.no
      span {{ proposal.tally_result.no }}
    .li-proposal__value.no_with_veto
      span {{ proposal.tally_result.no_with_veto }}
    .li-proposal__value.abstain
      span {{ proposal.tally_result.abstain }}
</template>

<script>
import moment from "moment"
export default {
  name: `li-proposal`,
  computed: {
    statusColor() {
      if (this.proposal.proposal_status === `Rejected`) return `red`
      else if (this.proposal.proposal_status === `Passed`) return `green`
    },
    // TODO redirect to proposal page
    proposalLink() {
      return {
        name: ``
      }
    }
  },
  props: [`proposal`]
}
</script>

<style lang="stylus">
@require '~variables'

.li-proposal
  margin 0.5rem 0rem 0.5rem 2rem

.li-proposal a
  display flex
  align-items center
  padding 1rem
  background-color var(--app-fg)
  border-radius 0.25rem
  border 1px solid var(--bc-dim)

  &:hover
    background var(--hover-bg)

  .li-proposal__value:not(:first-of-type) span
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

    &.green
      background-color rgba(46, 164, 45, 0.15)
      border solid 0.5px rgba(46, 164, 45, 0.25)
      color #2ea42d

  .li-proposal__value
    flex 1
    display flex
    align-items center
    min-width 0

    &.title
      flex 3

      a
        display flex

  .vert
    display flex
    flex-direction column
    color var(--bright)
    padding-left 1rem

    .top
      padding-bottom 0.5rem
      line-height 1rem
      font-size 1rem
      font-weight 500


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
