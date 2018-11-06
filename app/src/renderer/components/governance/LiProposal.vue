<template lang="pug">
tr.li-proposal.li-validator
  td.li-proposal__value
    h2 {{ proposal.title }}
    p Status: {{ proposal.proposal_status }}
    //- .proposal-profile__status(v-bind:class="statusColor" v-tooltip.top="proposal.proposal_status")
  td.li-proposal__value.yes {{ proposal.tally_result.yes }}
  td.li-proposal__value.no {{ proposal.tally_result.no }}
  td.li-proposal__value.no_with_veto {{ proposal.tally_result.no_with_veto }}
  td.li-proposal__value.abstain {{ proposal.tally_result.abstain }}
</template>

<script>
export default {
  name: `li-proposal`,
  computed: {
    statusColor() {
      if (this.proposal.proposal_status === `Rejected`) return `red`
      else if (this.proposal.proposal_status === `Passed`) return `green`
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
