<template lang="pug">
transition(name="proposal")
  router-link.card-proposal(:to="{ name: 'proposal', params: { proposal: proposal.id }}")
    .chart: chart-votes(:votes="proposal.votes")
    .text
      .title #[span {{ proposal.type }}] {{ proposal.title }}
      .meta
        .author {{ proposal.validatorId }}
        .date {{ proposalCreatedAtAgo }}
</template>

<script>
import ChartVotes from './ChartVotes'
import dateUnix from '../scripts/dateUnix'
import dateUnixAgo from '../scripts/dateUnixAgo'
export default {
  name: 'li-proposal',
  components: {
    ChartVotes
  },
  computed: {
    proposalCreatedAt () {
      return dateUnix(this.proposal.createdAt)
    },
    proposalCreatedAtAgo () {
      return dateUnixAgo(this.proposal.createdAt)
    }
  },
  methods: {
    viewProposal () {
      this.$router.push('/proposals/' + this.proposal.id)
    }
  },
  props: ['proposal'],
  mounted () {
    let self = this

    if (this.proposal.flags.new) {
      // console.log('this proposal is new')
      setTimeout(function () {
        self.proposal.flags.new = false
      }, 500)
    }
  }
}
</script>

<style lang="stylus">
@require '../styles/variables.styl'

.card-proposal
  border-bottom 1px solid bc-dim
  padding 0.75rem 1rem
  display flex
  position relative

  color txt
  &:before
  &:after
    dot()
    background bc
    bottom -2*px
  &:before
    left -1*px
  &:after
    right -1*px

  .chart
    width 4rem
    margin-right 1rem

  .text
    flex 1
    display flex
    flex-flow column nowrap

  .title
    flex 1

    height 2rem
    font-size 0.875rem

    overflow hidden
    text-overflow ellipsis

    span
      font-label()
      color dim
      font-size 0.5rem
      line-height 1rem - 2*px
      display inline-block
      padding 0 0.25rem
      vertical-align middle
      border 1px solid bc-dim

  .meta
    font-label()
    display flex
    line-height 1rem
    font-size 0.666rem
    .author
      margin-right 0.25rem
      color dim
    .date
      color faint
@media screen and (min-width: 768px)
  .card-proposal
    .chart
      margin-right 1rem
</style>
