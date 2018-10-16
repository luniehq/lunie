<template lang="pug">
transition(name="proposal")
  .card-proposal
    .chart: chart-votes(:votes="this.proposal.tally_result")
    .text
      .title #[span {{ this.proposal.type }}] {{ this.proposal.title }}
        .author Status: {{ this.proposal.proposal_status }}
        .date Submit Block: {{ this.proposal.submit_block }}
</template>
<script>
import moment from "moment"
import ChartVotes from "govern/ChartVotes"
export default {
  name: `li-proposal`,
  components: {
    ChartVotes
  },
  // computed: {
  //   proposalLink() {
  //     return { name: `proposal`, params: { proposal: this.proposal.proposal_id } }
  //   }
  // },
  props: [`proposal`]
}
</script>

<style lang="stylus">
@require '~variables'

.card-proposal
  border-bottom px solid var(--bc)
  padding 0.75rem 1rem
  display flex
  position relative

  color var(--txt)

  &:hover
    background var(--hover-bg)
    .title
      color var(--txt)

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
      font-size var(--sm)
      display inline-block
      padding 0 0.25rem
      vertical-align middle
      border px solid var(--bc)

  .meta
    font-size sm
    .author
      margin-right 0.25rem
      color var(--dim)
    .date
      color var(--dim)

@media screen and (min-width: 768px)
  .card-proposal
    .chart
      margin-right 1rem
</style>
