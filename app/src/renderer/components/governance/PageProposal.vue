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
          <h2 class="proposal-id">
            #{{ proposalId }}
          </h2>
          <div class="page-profile__header__info">
            <div class="page-profile__status-and-title">
              <span
                v-tooltip.top="status.message"
                :class="status.color"
                class="page-profile__status"
              />
              <h2 class="page-profile__title">
                {{ proposal.title }}
              </h2>
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
                num.atoms(proposal.total_deposit[0].amount) +
                  ` ` +
                  proposal.total_deposit[0].denom
              }}
            </dd>
          </dl>
          <dl v-if="proposal.proposal_status === 'VotingPeriod'" class="info_dl colored_dl">
            <dt>Vote Count</dt>
            <dd>{{ num.atoms(totalVotes) }}</dd>
          </dl>
        </div>
      </div>

      <div class="page-profile__section">
        <div v-if="proposal.proposal_status === 'VotingPeriod'" class="row">
          <dl class="info_dl colored_dl">
            <dt>Yes</dt>
            <dd>{{ num.atoms(tally.yes) }} / {{ yesPercentage }}</dd>
          </dl>
          <dl class="info_dl colored_dl">
            <dt>No</dt>
            <dd>{{ num.atoms(tally.no) }} / {{ noPercentage }}</dd>
          </dl>
          <dl class="info_dl colored_dl">
            <dt>No with Veto</dt>
            <dd>{{ num.atoms(tally.no_with_veto) }} / {{ noWithVetoPercentage }}</dd>
          </dl>
          <dl class="info_dl colored_dl">
            <dt>Abstain</dt>
            <dd>{{ num.atoms(tally.abstain) }} / {{ abstainPercentage }}</dd>
          </dl>
        </div>
        <div class="row">
          <div class="column">
            <dl class="info_dl colored_dl">
              <dt>Description</dt>
              <dd>
                <text-block :content="proposal.description" />
              </dd>
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
    num,
    lastVote: undefined
  }),
  computed: {
    ...mapGetters([
      `depositDenom`,
      `proposals`,
      `connected`,
      `wallet`,
      `votes`,
      `session`
    ]),
    proposal({ proposals, proposalId } = this) {
      return proposals.proposals[proposalId]
    },
    submittedAgo({ proposal } = this) {
      return moment(new Date(proposal.submit_time)).fromNow()
    },
    votingStartedAgo({ proposal } = this) {
      return moment(new Date(proposal.voting_start_time)).fromNow()
    },
    depositEndsIn({ proposal } = this) {
      return moment(new Date(proposal.deposit_end_time)).fromNow()
    },
    totalVotes({ tally: { yes, no, no_with_veto, abstain } } = this) {
      return yes + no + no_with_veto + abstain
    },
    yesPercentage({ tally, totalVotes } = this) {
      return num.percentInt(tally.yes / totalVotes)
    },
    noPercentage({ tally, totalVotes } = this) {
      return num.percentInt(tally.no / totalVotes)
    },
    noWithVetoPercentage({ tally, totalVotes } = this) {
      return num.percentInt(tally.no_with_veto / totalVotes)
    },
    abstainPercentage({ tally, totalVotes } = this) {
      return num.percentInt(tally.abstain / totalVotes)
    },
    tally({ proposals, proposalId } = this) {
      // TODO:MICROATOMS currently causes each vote to be multiplied by this, once we receive atoms let's drop this multiplier thing
      const multiplier = 100000000
      const { yes, no, abstain, no_with_veto } =
        proposals.tallies[proposalId] || {}
      return {
        yes: yes / multiplier,
        no: no / multiplier,
        abstain: abstain / multiplier,
        no_with_veto: no_with_veto / multiplier
      }
    },
    status({ proposal } = this) {
      if (proposal.proposal_status === `Passed`)
        return {
          message: `This proposal has passed`
        }
      if (proposal.proposal_status === `Rejected`)
        return {
          message: `This proposal has been rejected and voting is closed`,
          color: `red`
        }
      if (proposal.proposal_status === `DepositPeriod`)
        return {
          message: `Deposits are open for this proposal`,
          color: `yellow`
        }
      if (proposal.proposal_status === `VotingPeriod`)
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
  async mounted({ proposals, proposalId, $store } = this) {
    if (!proposals[proposalId]) {
      await $store.dispatch(`getProposal`, proposalId)
    }
  },
  methods: {
    async onVote({ $refs, $store, votes, proposalId, wallet } = this) {
      $refs.modalVote.open()
      // The error is already handled with notifyError in votes.js
      await $store.dispatch(`getProposalVotes`, proposalId)
      this.lastVote =
        votes[proposalId] &&
        votes[proposalId].find(e => e.voter === wallet.address)
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
