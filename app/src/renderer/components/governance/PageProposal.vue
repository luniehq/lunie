<template>
  <tm-page data-title="Proposal">
    <template slot="menu-body">
      <tm-balance />
      <tool-bar />
    </template>

    <tm-data-error v-if="!proposal" />

    <template v-else>
      <div class="page-profile__header page-profile__section proposal">
        <div class="row">
          <h2 class="proposal-id">#{{ proposalId }}</h2>
          <div class="page-profile__header__info">
            <div class="page-profile__status-and-title">
              <span
                v-tooltip.top="status.message"
                :class="status.color"
                class="page-profile__status"
              />
              <h2 class="page-profile__title">{{ proposal.title }}</h2>
              <h3 v-if="session.devMode">
                Proposer: {{ proposal.proposer || "Fede" }}
              </h3>
            </div>

            <div class="page-profile__header__actions">
              <tm-btn
                v-if="proposal.proposal_status === 'VotingPeriod'"
                id="vote-btn"
                :value="connected ? 'Vote' : 'Connecting...'"
                :disabled="!connected"
                color="primary"
                @click.native="onVote"
              />
              <tm-btn
                v-if="proposal.proposal_status === 'DepositPeriod'"
                id="deposit-btn"
                :value="connected ? 'Deposit' : 'Connecting...'"
                :disabled="!connected"
                color="primary"
                @click.native="onDeposit"
              />
              <tm-btn
                v-if="proposal.proposal_status === 'Passed'"
                value="Vote Passed"
                disabled="disabled"
                color="primary"
              />
              <tm-btn
                v-if="proposal.proposal_status === 'Rejected'"
                value="Vote Rejected"
                disabled="disabled"
                color="primary"
              />
            </div>
          </div>
        </div>
        <div class="row">
          <dl class="info_dl colored_dl">
            <dt>Submitted</dt>
            <dd>{{ submittedAgo }}</dd>
          </dl>
          <dl class="info_dl colored_dl">
            <dt>Proposal Status</dt>
            <dd>
              {{
                proposal.proposal_status === `DepositPeriod`
                  ? `Deposit period ends ${depositEndsIn}.`
                  : `Voting started ${votingStartedAgo}.`
              }}
            </dd>
          </dl>

          <dl class="info_dl colored_dl">
            <dt>Deposit Count</dt>
            <dd>
              {{
                proposal.total_deposit[0].amount +
                  ` ` +
                  proposal.total_deposit[0].denom
              }}
            </dd>
          </dl>
          <dl
            v-if="proposal.proposal_status === 'VotingPeriod'"
            class="info_dl colored_dl"
          >
            <dt>Vote Count</dt>
            <dd>{{ totalVotes }}</dd>
          </dl>
        </div>
      </div>

      <div class="page-profile__section">
        <div v-if="proposal.proposal_status === 'VotingPeriod'" class="row">
          <dl class="info_dl colored_dl">
            <dt>Yes</dt>
            <dd>{{ tally.yes }} / {{ yesPercentage }}</dd>
          </dl>
          <dl class="info_dl colored_dl">
            <dt>No</dt>
            <dd>{{ tally.no }} / {{ noPercentage }}</dd>
          </dl>
          <dl class="info_dl colored_dl">
            <dt>No with Veto</dt>
            <dd>{{ tally.no_with_veto }} / {{ noWithVetoPercentage }}</dd>
          </dl>
          <dl class="info_dl colored_dl">
            <dt>Abstain</dt>
            <dd>{{ tally.abstain }} / {{ abstainPercentage }}</dd>
          </dl>
        </div>
        <div class="row">
          <div class="column">
            <dl class="info_dl colored_dl">
              <dt>Description</dt>
              <dd><text-block :content="proposal.description" /></dd>
            </dl>
          </div>
        </div>
      </div>

      <modal-deposit
        ref="modalDeposit"
        :proposal-id="proposalId"
        :proposal-title="proposal.title"
        :denom="depositDenom"
      />
      <modal-vote
        ref="modalVote"
        :proposal-id="proposalId"
        :proposal-title="proposal.title"
        :last-vote-option="lastVote && lastVote.option"
      />
    </template>
  </tm-page>
</template>

<script>
import moment from "moment"
import { mapGetters } from "vuex"
import num from "scripts/num"
import TmBtn from "common/TmBtn"
import ToolBar from "common/ToolBar"
import TmBalance from "common/TmBalance"
import TmDataError from "common/TmDataError"
import TextBlock from "common/TextBlock"
import ModalDeposit from "./ModalDeposit"
import ModalVote from "./ModalVote"
import TmPage from "common/TmPage"
export default {
  name: `page-proposal`,
  components: {
    TmBalance,
    TmBtn,
    ModalDeposit,
    ModalVote,
    ToolBar,
    TmDataError,
    TmPage,
    TextBlock
  },
  props: {
    proposalId: {
      type: String,
      required: true
    }
  },
  data: () => ({
    lastVote: undefined
  }),
  computed: {
    ...mapGetters([
      `depositDenom`,
      `proposals`,
      `connected`,
      `wallet`,
      `votes`,
      `session`,
      `session`
    ]),
    proposal() {
      return this.proposals.proposals[this.proposalId]
    },
    submittedAgo() {
      return moment(new Date(this.proposal.submit_time)).fromNow()
    },
    votingStartedAgo() {
      return moment(new Date(this.proposal.voting_start_time)).fromNow()
    },
    depositEndsIn() {
      return moment(new Date(this.proposal.deposit_end_time)).fromNow()
    },
    totalVotes() {
      return (
        this.tally.yes +
        this.tally.no +
        this.tally.no_with_veto +
        this.tally.abstain
      )
    },
    yesPercentage() {
      return num.percentInt(this.tally.yes / this.totalVotes)
    },
    noPercentage() {
      return num.percentInt(this.tally.no / this.totalVotes)
    },
    noWithVetoPercentage() {
      return num.percentInt(this.tally.no_with_veto / this.totalVotes)
    },
    abstainPercentage() {
      return num.percentInt(this.tally.abstain / this.totalVotes)
    },
    tally() {
      const proposalTally = this.proposals.tallies[this.proposalId] || {}
      proposalTally.yes = Math.round(parseFloat(proposalTally.yes))
      proposalTally.no = Math.round(parseFloat(proposalTally.no))
      proposalTally.no_with_veto = Math.round(
        parseFloat(proposalTally.no_with_veto)
      )
      proposalTally.abstain = Math.round(parseFloat(proposalTally.abstain))
      return proposalTally
    },
    status() {
      if (this.proposal.proposal_status === `Passed`)
        return {
          message: `This proposal has passed`
        }
      if (this.proposal.proposal_status === `Rejected`)
        return {
          message: `This proposal has been rejected and voting is closed`,
          color: `red`
        }
      if (this.proposal.proposal_status === `DepositPeriod`)
        return {
          message: `Deposits are open for this proposal`,
          color: `yellow`
        }
      if (this.proposal.proposal_status === `VotingPeriod`)
        return {
          message: `Voting for this proposal is open`,
          color: `green`
        }
      else
        return {
          message: `There was an error determining the status of this proposal.`,
          color: `grey`
        }
    }
  },
  methods: {
    async onVote() {
      this.$refs.modalVote.open()
      // The error is already handled with notifyError in votes.js
      await this.$store.dispatch(`getProposalVotes`, this.proposalId)
      this.lastVote =
        this.votes[this.proposalId] &&
        this.votes[this.proposalId].find(e => e.voter === this.wallet.address)
    },
    onDeposit() {
      this.$refs.modalDeposit.open()
    }
  }
}
</script>
<style>
.proposal-id {
  display: block;
  background: var(--app-nav);
  height: 8rem;
  width: 9rem;
  margin: 1rem 2rem 1rem 1rem;
  padding: 1rem;
  font-style: italic;
}
</style>
