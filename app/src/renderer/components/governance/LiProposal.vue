<template lang="pug">
tr.li-proposal.li-validator
  td.li-proposal__value
    h2
      router-link(:to="{ name: 'Proposal', params: { proposalId, proposal }}") {{ proposal.title }}
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
      if (this.proposal.proposal_status === "Passed") return `green`
      if (this.proposal.proposal_status === "Rejected") return `red`
      if (this.proposal.proposal_status === "Active") return `blue`
      if (this.proposal.proposal_status === "Pending") return `yellow`
    },
    status() {
      if (this.proposal.proposal_status === "Passed")
        return `This proposal has passed`

      if (this.proposal.proposal_status === "Rejected")
        return `This proposal has been rejected and voting is closed`

      if (this.proposal.proposal_status === "Active")
        return `Voting for this proposal is open`

      if (this.proposal.proposal_status === "Pending")
        return `Deposits are open for this proposal`
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
