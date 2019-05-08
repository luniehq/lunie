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
        </span>
        <span
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
          {{ proposal.proposal_content.value.title }}
        </router-link>
        <p class="data-table__row__info__container__description">
          {{ description }}
        </p>
      </div>
    </td>
    <td>{{ `#` + proposal.proposal_id }}</td>
    <td class="li-proposal__value yes">
      {{ tally.yes | percentOrPending(totalVotes, isDepositPeriod) }}
    </td>
    <td class="li-proposal__value no">
      {{ tally.no | percentOrPending(totalVotes, isDepositPeriod) }}
    </td>
    <td class="li-proposal__value no_with_veto">
      {{ tally.no_with_veto | percentOrPending(totalVotes, isDepositPeriod) }}
    </td>
    <td class="li-proposal__value abstain">
      {{ tally.abstain | percentOrPending(totalVotes, isDepositPeriod) }}
    </td>
  </tr>
</template>

<script>
import BigNumber from "bignumber.js"
import { mapGetters } from "vuex"
import { percentOrPending } from "../../filters"
export default {
  name: `li-proposal`,
  filters: {
    percentOrPending
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
      return {
        yes: yes || BigNumber(0),
        no: no || BigNumber(0),
        abstain: abstain || BigNumber(0),
        no_with_veto: no_with_veto || BigNumber(0)
      }
    },
    isDepositPeriod() {
      return this.proposal.proposal_status === `DepositPeriod`
    },
    totalVotes({ tally: { yes, no, no_with_veto, abstain } } = this) {
      return BigNumber(yes)
        .plus(no)
        .plus(no_with_veto)
        .plus(abstain)
        .toNumber()
    },
    status() {
      switch (this.proposal.proposal_status) {
        case `Passed`:
          return {
            message: `This proposal has passed`
          }
        case `Rejected`:
          return {
            message: `This proposal has been rejected and voting is closed`,
            color: `red`
          }
        case `DepositPeriod`:
          return {
            message: `Deposits are open for this proposal`,
            color: `yellow`
          }
        case `VotingPeriod`:
          return {
            message: `Voting for this proposal is open`,
            color: `green`
          }
        default:
          return {
            message: `There was an error determining the status of this proposal.`,
            color: `grey`
          }
      }
    },
    description() {
      const { description } = this.proposal.proposal_content.value
      return description.length > 100
        ? description.substring(0, 100) + `…`
        : description.substring(0, 100)
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
