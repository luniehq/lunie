<template>
  <tr class="data-table__row li-proposal">
    <td class="data-table__row__info">
      <div class="data-table__row__info__container">
        <span
          v-if="proposal.proposal_status === `Passed`"
          v-tooltip.top="status.message"
          :class="status.color"
          class="data-table__row__info__container__status material-icons"
        >
          checkmark
        </span><span
          v-else
          v-tooltip.top="status.message"
          :class="status.color"
          class="data-table__row__info__container__status"
        />
        <router-link
          :to="{
            name: 'Proposal',
            params: { proposalId: proposal.proposal_id }
          }"
          class="data-table__row__info__container__name"
        >
          {{ proposal.title }}
        </router-link>
        <p class="data-table__row__info__container__description">
          {{ description }}
        </p>
      </div>
    </td>
    <td>{{ `#` + proposal.proposal_id }}</td>
    <td class="li-proposal__value yes">
      {{ yesPercentage || `--` }}
    </td>
    <td class="li-proposal__value no">
      {{ noPercentage || `--` }}
    </td>
    <td class="li-proposal__value no_with_veto">
      {{ noWithVetoPercentage || `--` }}
    </td>
    <td class="li-proposal__value abstain">
      {{ abstainPercentage || `--` }}
    </td>
  </tr>
</template>

<script>
import BigNumber from "bignumber.js"
import { mapGetters } from "vuex"
import { percentInt } from "../../scripts/num.js"
export default {
  name: `li-proposal`,
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
      return {
        yes: yes || BigNumber(0),
        no: no || BigNumber(0),
        abstain: abstain || BigNumber(0),
        no_with_veto: no_with_veto || BigNumber(0)
      }
    },
    totalVotes({ tally: { yes, no, no_with_veto, abstain } } = this) {
      return BigNumber(yes)
        .plus(no)
        .plus(no_with_veto)
        .plus(abstain)
        .toNumber()
    },
    yesPercentage({ tally, totalVotes } = this) {
      if (this.proposal.proposal_status === `DepositPeriod`) {
        return `--`
      }
      return percentInt(totalVotes === 0 ? 0 : tally.yes / totalVotes)
    },
    noPercentage({ tally, totalVotes } = this) {
      if (this.proposal.proposal_status === `DepositPeriod`) {
        return `--`
      }
      return percentInt(totalVotes === 0 ? 0 : tally.no / totalVotes)
    },
    noWithVetoPercentage({ tally, totalVotes } = this) {
      if (this.proposal.proposal_status === `DepositPeriod`) {
        return `--`
      }
      return percentInt(totalVotes === 0 ? 0 : tally.no_with_veto / totalVotes)
    },
    abstainPercentage({ tally, totalVotes } = this) {
      if (this.proposal.proposal_status === `DepositPeriod`) {
        return `--`
      }
      return percentInt(totalVotes === 0 ? 0 : tally.abstain / totalVotes)
    },
    status() {
      if (this.proposal.proposal_status === `Passed`) {
        return {
          message: `This proposal has passed`
        }
      } else if (this.proposal.proposal_status === `Rejected`) {
        return {
          message: `This proposal has been rejected and voting is closed`,
          color: `red`
        }
      } else if (this.proposal.proposal_status === `DepositPeriod`) {
        return {
          message: `Deposits are open for this proposal`,
          color: `yellow`
        }
      } else if (this.proposal.proposal_status === `VotingPeriod`) {
        return {
          message: `Voting for this proposal is open`,
          color: `green`
        }
      } else {
        return {
          message: `There was an error determining the status of this proposal.`,
          color: `grey`
        }
      }
    },
    description() {
      return this.proposal.description.length > 100
        ? this.proposal.description.substring(0, 100) + `…`
        : this.proposal.description.substring(0, 100)
    }
  }
}
</script>

<style>
.data-table__row__info__container__status.material-icons {
  width: 1rem;
  height: 1rem;
  overflow: hidden;
  top: 4px;
  left: -4px;
  color: var(--success);
  background: none;
}
</style>
