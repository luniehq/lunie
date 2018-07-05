<template lang="pug">
transition(name="proposal")
  router-link.card-proposal(:to="proposalLink")
    .chart: chart-votes(:votes="proposal.votes")
    .text
      .title #[span {{ proposal.type }}] {{ proposal.title }}
      .meta
        .author {{ proposal.validatorId }}
        .date {{ timeAgo(this.proposal.createdAt) }}
</template>

<script>
import ChartVotes from "govern/ChartVotes"
import moment from "moment"
export default {
  name: "li-proposal",
  components: { ChartVotes },
  computed: {
    proposalLink() {
      return { name: "proposal", params: { proposal: this.proposal.id } }
    }
  },
  methods: {
    timeAgo(date) {
      return moment(date, "x").fromNow()
    }
  },
  props: ["proposal"]
}
</script>

<style lang="stylus">
@require '~variables'

@media screen and (min-width: 768px)
  .card-proposal
    .chart
      margin-right 1rem

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
    display flex
    font-size sm

    .author
      margin-right 0.25rem
      color var(--dim)

    .date
      color var(--dim)
</style>
