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
import ChartVotes from 'govern/ChartVotes'
import dateUnix from 'scripts/dateUnix'
import dateUnixAgo from 'scripts/dateUnixAgo'
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
@require '~variables'

.card-proposal
  border-bottom 1px solid bc
  padding 0.75rem 1rem
  display flex
  position relative

  color txt

  &:hover
    background hover-bg
    .title
      color bright

  .chart
    width 4rem
    margin-right 1rem

  .text
    flex 1
    display flex
    flex-flow column nowrap

  .title
    flex 1
    overflow hidden
    text-overflow ellipsis

    span
      color dim
      font-size sm
      display inline-block
      padding 0 0.25rem
      vertical-align middle
      border 1px solid bc

  .meta
    display flex
    font-size sm
    .author
      margin-right 0.25rem
      color dim
    .date
      color dim

@media screen and (min-width: 768px)
  .card-proposal
    .chart
      margin-right 1rem
</style>
