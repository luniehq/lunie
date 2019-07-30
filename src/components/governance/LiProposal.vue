<template>
  <tr
    class="li-proposal"
    @click="
      $router.push({
        name: 'Proposal',
        params: { proposalId: proposal.proposal_id }
      })
    "
  >
    <td>
      <span :class="status.color" class="proposal-status">{{
        status.badge
      }}</span>
      <h3 class="li-proposal-title">
        {{ proposal.proposal_content.value.title }}
      </h3>
      <p class="li-proposal-description">
        {{ description }}
      </p>
    </td>
  </tr>
</template>

<script>
import BigNumber from "bignumber.js"
import { mapGetters } from "vuex"
import { roundObjectPercentages } from "../../utils"
import { prettyDecimals } from "../../scripts/num"
export default {
  name: `li-proposal`,
  filters: {
    prettyDecimals
  },
  props: {
    proposal: {
      type: Object,
      required: true
    }
  },
  computed: {
    ...mapGetters([`proposals`]),
    tally() {
      const { yes, no, abstain, no_with_veto } =
        this.proposals.tallies[this.proposal.proposal_id] || {}

      const totalVotes = BigNumber(yes)
        .plus(no)
        .plus(no_with_veto)
        .plus(abstain)
        .toNumber()
      const totalMult = totalVotes / 100
      return {
        yes: yes / totalMult || BigNumber(0),
        no: no / totalMult || BigNumber(0),
        abstain: abstain / totalMult || BigNumber(0),
        no_with_veto: no_with_veto / totalMult || BigNumber(0)
      }
    },
    roundedPercentagesTally() {
      return roundObjectPercentages(this.tally)
    },
    isDepositPeriod() {
      return this.proposal.proposal_status === `DepositPeriod`
    },
    status() {
      switch (this.proposal.proposal_status) {
        case `Passed`:
          return {
            badge: `Passed`,
            color: `green`
          }
        case `Rejected`:
          return {
            badge: `Rejected`,
            color: `red`
          }
        case `DepositPeriod`:
          return {
            badge: `Deposit Period`,
            color: `orange`
          }
        case `VotingPeriod`:
          return {
            badge: `Voting Period`,
            color: `pink`
          }
        default:
          return {
            badge: `Error`,
            color: `grey`
          }
      }
    },
    description() {
      const { description } = this.proposal.proposal_content.value
      return description.length > 200
        ? description.substring(0, 200) + `…`
        : description.substring(0, 200)
    }
  }
}
</script>
<style scoped>
.li-proposal {
  margin: 0 0 1rem;
  padding: 1rem;
  display: block;
  cursor: pointer;
  max-width: 680px;
  background-color: var(--app-fg);
  border-radius: 0.25rem;
  border: 1px solid var(--bc-dim);
}

.li-proposal-title {
  font-size: var(--lg);
  line-height: 26px;
  font-weight: 500;
  display: block;
  padding: 1rem 0 0.25rem 0;
}

.li-proposal-description {
  word-break: break-word;
  color: var(--txt);
}
</style>
<style>
.proposal-status {
  text-transform: uppercase;
  font-size: 10px;
  font-weight: 600;
  border: 2px solid;
  padding: 2px 4px;
  border-radius: 0.25rem;
}

.proposal-status.red {
  color: var(--danger);
  border-color: var(--danger);
}

.proposal-status.orange {
  color: var(--warning);
  border-color: var(--warning);
}

.proposal-status.green {
  color: var(--success);
  border-color: var(--success);
}

.proposal-status.pink {
  color: var(--tertiary);
  border-color: var(--tertiary);
}
</style>

