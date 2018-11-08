<template lang="pug">
tr.li-proposal.li-validator
  td.li-proposal__value
    h2
      router-link(:to="{ name: 'Proposal', params: { proposalId, proposal, status }}") {{ proposal.title }}
    span.validator-profile__status(v-bind:class="statusColor" v-tooltip.top="status")
    p {{ description }}
  td {{ submitBlock }}
  td.li-proposal__value.yes {{ proposal.tally_result.yes }}
  td.li-proposal__value.no {{ proposal.tally_result.no }}
  td.li-proposal__value.no_with_veto {{ proposal.tally_result.no_with_veto }}
  td.li-proposal__value.abstain {{ proposal.tally_result.abstain }}
</template>

<script>
import num from "scripts/num"
export default {
  name: `li-proposal`,
  computed: {
    statusColor() {
      if (this.proposal.proposal_status === `Passed`) return `green`
      if (this.proposal.proposal_status === `Rejected`) return `red`
      if (this.proposal.proposal_status === `Active`) return `blue`
      if (this.proposal.proposal_status === `Pending`) return `yellow`
    },
    status() {
      switch (this.proposal.proposal_status) {
        case `Passed`:
          return {
            button: null,
            message: `This proposal has passed`,
            color: `green`
          }
          break
        case `Rejected`:
          return {
            button: null,
            message: `This proposal has been rejected and voting is closed`,
            color: `red`
          }
          break
        case `Active`:
          return {
            button: `vote`,
            message: `Voting for this proposal is open`,
            color: `blue`
          }
          break
        case `Pending`:
          return {
            button: `deposit`,
            message: `Deposits are open for this proposal`,
            color: `yellow`
          }
          break
        default:
          return {
            button: null,
            message: `There was an error determining the status of this proposal`,
            color: `grey`
          }
      }
    },
    description() {
      return this.proposal.description.substring(0, 100)
    },
    submitBlock() {
      return `#` + num.prettyInt(this.proposal.submit_block)
    },
    proposalId() {
      return this.proposal.proposal_id
    }
  },
  props: [`proposal`]
}
</script>

<style lang="stylus">
@require '~variables'

.li-proposal
  margin 0.5rem 0rem 0.5rem 2rem

  td
    padding 0.5rem
</style>
