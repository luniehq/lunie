<template lang="pug">
tr.li-proposal
  td.li-proposal__value
    span.validator-profile__status(v-bind:class="status.color" v-tooltip.top="status.message")
    h2
      router-link(:to="{ name: 'Proposal', params: { proposalId: proposal.proposal_id, proposal, status }}") {{ proposal.title }}
    p {{ description }}
  td {{ `#` + proposal.proposal_id }}
  td.li-proposal__value.yes {{ proposal.tally_result.yes }}
  td.li-proposal__value.no {{ proposal.tally_result.no }}
  td.li-proposal__value.no_with_veto {{ proposal.tally_result.no_with_veto }}
  td.li-proposal__value.abstain {{ proposal.tally_result.abstain }}
</template>

<script>
export default {
  name: `li-proposal`,
  computed: {
    status() {
      if (this.proposal.proposal_status === `Passed`)
        return {
          button: null,
          message: `This proposal has passed`,
          color: `green`
        }
      if (this.proposal.proposal_status === `Rejected`)
        return {
          button: null,
          message: `This proposal has been rejected and voting is closed`,
          color: `red`
        }
      if (this.proposal.proposal_status === `DepositPeriod`)
        return {
          button: `deposit`,
          message: `Deposits are open for this proposal`,
          color: `yellow`
        }
      if (this.proposal.proposal_status === `VotingPeriod`)
        return {
          button: `vote`,
          message: `Voting for this proposal is open`,
          color: `blue`
        }
      else
        return {
          button: null,
          message: `There was an error determining the status of this proposal.`,
          color: `grey`
        }
    },
    description() {
      return this.proposal.description.length > 100
        ? this.proposal.description.substring(0, 100) + `…`
        : this.proposal.description.substring(0, 100)
    }
  },
  props: [`proposal`]
}
</script>

<style lang="stylus">
@require '~variables'

.li-proposal
  margin 0.5rem 0rem 0.5rem 2rem
  background-color var(--app-fg)
  border-radius 0.25rem
  border 1px solid var(--bc-dim)

  &:hover
    background var(--hover-bg)

  .validator-profile__status
    position relative
    left 0
    top inherit
    display inline-block

  h2
    display inline-block
    padding-left 0.5rem

  td
    padding 1rem 0.5rem
</style>
