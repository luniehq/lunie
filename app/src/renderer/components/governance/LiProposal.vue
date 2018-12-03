<template>
  <tr class="li-proposal">
    <td class="li-proposal__value">
      <div class="li-proposal__title-container">
        <span
          v-tooltip.top="status.message"
          v-if="proposal.proposal_status === `Passed`"
          :class="status.color"
          class="material-icons"
          >checkmark</span
        ><span
          v-tooltip.top="status.message"
          v-else
          :class="status.color"
          class="validator-profile__status"
        />
        <h2>
          <router-link
            :to="{
              name: 'Proposal',
              params: { proposalId: proposal.proposal_id }
            }"
            >{{ proposal.title }}</router-link
          >
        </h2>
        <p class="li-proposal__description">{{ description }}</p>
      </div>
    </td>
    <td>{{ `#` + proposal.proposal_id }}</td>
    <td class="li-proposal__value yes">{{ proposal.tally_result.yes }}</td>
    <td class="li-proposal__value no">{{ proposal.tally_result.no }}</td>
    <td class="li-proposal__value no_with_veto">
      {{ proposal.tally_result.no_with_veto }}
    </td>
    <td class="li-proposal__value abstain">
      {{ proposal.tally_result.abstain }}
    </td>
  </tr>
</template>

<script>
export default {
  name: `li-proposal`,
  props: {
    proposal: {
      type: Object,
      required: true
    }
  },
  computed: {
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
.li-proposal {
  margin: 0.5rem 0rem 0.5rem 2rem;
  background-color: var(--app-fg);
  border-radius: 0.25rem;
  border: 1px solid var(--bc-dim);
}
.li-proposal:hover {
  background: var(--hover-bg);
}
.li-proposal__description {
  font-size: 14px;
  padding: 0.25rem 0 0 1rem;
  min-width: 284px;
  color: var(--dim);
}
.li-proposal .validator-profile__status {
  position: absolute;
  left: 0;
  top: 9px;
  display: inline-block;
}
.li-proposal h2 {
  display: inline-block;
  font-size: 16px;
  padding-left: 1rem;
}
.li-proposal td {
  padding: 1rem 0.5rem;
}
.li-proposal__title-container {
  position: relative;
}
.li-proposal__title-container .material-icons {
  display: inline-block;
  position: absolute;
  width: 1rem;
  height: 1rem;
  overflow: hidden;
  top: 4px;
  left: -4px;
  color: var(--success);
}
</style>
