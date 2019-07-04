<template>
  <TmPage data-title="Proposal">
    <TmDataLoading v-if="!proposals.loaded || !governanceParameters.loaded" />
    <TmDataError v-else-if="!proposal" />
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
              <h2 class="page-profile__title">
                {{ title }}
              </h2>
            </div>

            <div class="page-profile__header__actions">
              <TmBtn
                v-if="proposal.proposal_status === 'VotingPeriod'"
                id="vote-btn"
                :value="connected ? 'Vote' : 'Connecting...'"
                :disabled="!connected"
                color="primary"
                @click.native="() => onVote()"
              />
              <TmBtn
                v-if="proposal.proposal_status === 'DepositPeriod'"
                id="deposit-btn"
                :value="connected ? 'Deposit' : 'Connecting...'"
                :disabled="!connected"
                color="primary"
                @click.native="onDeposit"
              />
              <TmBtn
                v-if="proposal.proposal_status === 'Passed'"
                value="Vote Passed"
                disabled="disabled"
                color="primary"
              />
              <TmBtn
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
              {{ proposalStatus }}
            </dd>
          </dl>
          <dl v-if="displayEndDate" class="info_dl colored_dl">
            <dt>Voting End Date</dt>
            <dd>{{ endDate }}</dd>
          </dl>
        </div>
      </div>

      <div class="page-profile__section">
        <div class="row">
          <dl class="info_dl colored_dl">
            <dt>Deposit Count</dt>
            <dd>
              {{
                totalDeposit
                  ? `${totalDeposit.amount}
              ${totalDeposit.denom}`
                  : `--`
              }}
            </dd>
          </dl>
          <dl
            v-if="proposal.proposal_status === 'VotingPeriod'"
            class="info_dl colored_dl"
          >
            <dt>Total Vote Count</dt>
            <dd>{{ num.shortDecimals(num.atoms(totalVotes)) }}</dd>
          </dl>
        </div>
        <div v-if="proposal.proposal_status === 'VotingPeriod'" class="row">
          <dl class="info_dl colored_dl">
            <dt>Yes</dt>
            <dd>
              {{ num.shortDecimals(num.atoms(tally.yes)) }} /
              {{ yesPercentage }}
            </dd>
          </dl>
          <dl class="info_dl colored_dl">
            <dt>No</dt>
            <dd>
              {{ num.shortDecimals(num.atoms(tally.no)) }} /
              {{ noPercentage }}
            </dd>
          </dl>
          <dl class="info_dl colored_dl">
            <dt>No with Veto</dt>
            <dd>
              {{ num.shortDecimals(num.atoms(tally.no_with_veto)) }} /
              {{ noWithVetoPercentage }}
            </dd>
          </dl>
          <dl class="info_dl colored_dl">
            <dt>Abstain</dt>
            <dd>
              {{ num.shortDecimals(num.atoms(tally.abstain)) }} /
              {{ abstainPercentage }}
            </dd>
          </dl>
        </div>
        <div class="row">
          <div class="column">
            <dl class="info_dl colored_dl">
              <dt>Description</dt>
              <TextBlock :content="description" />
            </dl>
          </div>
        </div>
      </div>

      <ModalDeposit
        ref="modalDeposit"
        :proposal-id="proposalId"
        :proposal-title="title"
        :denom="depositDenom"
      />
      <ModalVote
        ref="modalVote"
        :proposal-id="proposalId"
        :proposal-title="title"
        :last-vote-option="lastVote && lastVote.option"
      />
    </template>
  </TmPage>
</template>

<script>
import moment from "moment"
import BigNumber from "bignumber.js"
import { mapGetters } from "vuex"
import num from "scripts/num"
import TmBtn from "common/TmBtn"
import TmDataError from "common/TmDataError"
import TmDataLoading from "common/TmDataLoading"
import TextBlock from "common/TextBlock"
import ModalDeposit from "src/ActionModal/components/ModalDeposit"
import ModalVote from "src/ActionModal/components/ModalVote"
import TmPage from "common/TmPage"
export default {
  name: `page-proposal`,
  components: {
    TmBtn,
    ModalDeposit,
    ModalVote,
    TmDataError,
    TmDataLoading,
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
      `governanceParameters`,
      `session`
    ]),
    proposal({ proposals, proposalId } = this) {
      return proposals.proposals[proposalId]
    },
    title({ proposal } = this) {
      return proposal.proposal_content.value.title
    },
    description({ proposal } = this) {
      return proposal.proposal_content.value.description
    },
    submittedAgo({ proposal } = this) {
      return moment(new Date(proposal.submit_time)).fromNow()
    },
    endDate({ proposal } = this) {
      return moment(proposal.voting_end_time).format("MMMM Do YYYY, HH:mm")
    },
    displayEndDate({ proposal, governanceParameters } = this) {
      if (
        proposal.proposal_status !== "DepositPeriod" &&
        proposal.total_deposit[0].amount >=
          Number(governanceParameters.parameters.deposit.min_deposit[0].amount)
      ) {
        return true
      } else {
        return false
      }
    },
    votingStartedAgo({ proposal } = this) {
      return moment(new Date(proposal.voting_start_time)).fromNow()
    },
    proposalStatus({ proposal, depositEndsIn, votingStartedAgo } = this) {
      if (proposal.proposal_status === "DepositPeriod") {
        return `Deposit period ends ${depositEndsIn}`
      } else if (proposal.proposal_status === "VotingPeriod") {
        return `Voting started ${votingStartedAgo}`
      } else if (proposal.proposal_status === "Rejected") {
        return "Rejected"
      } else if (proposal.proposal_status === "Passed") {
        return "Passed"
      } else {
        return false
      }
    },
    depositEndsIn({ proposal } = this) {
      return moment(new Date(proposal.deposit_end_time)).fromNow()
    },
    totalVotes({ tally: { yes, no, no_with_veto, abstain } } = this) {
      return BigNumber(yes)
        .plus(no)
        .plus(no_with_veto)
        .plus(abstain)
        .toNumber()
    },
    yesPercentage({ tally, totalVotes } = this) {
      return num.percentInt(totalVotes === 0 ? 0 : tally.yes / totalVotes)
    },
    noPercentage({ tally, totalVotes } = this) {
      return num.percentInt(totalVotes === 0 ? 0 : tally.no / totalVotes)
    },
    noWithVetoPercentage({ tally, totalVotes } = this) {
      return num.percentInt(
        totalVotes === 0 ? 0 : tally.no_with_veto / totalVotes
      )
    },
    abstainPercentage({ tally, totalVotes } = this) {
      return num.percentInt(totalVotes === 0 ? 0 : tally.abstain / totalVotes)
    },
    tally({ proposals, proposalId } = this) {
      const { yes, no, abstain, no_with_veto } =
        proposals.tallies[proposalId] || {}
      return {
        yes: yes || BigNumber(0),
        no: no || BigNumber(0),
        abstain: abstain || BigNumber(0),
        no_with_veto: no_with_veto || BigNumber(0)
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
    },
    totalDeposit() {
      return this.proposal.total_deposit
        ? num.createDisplayCoin(this.proposal.total_deposit[0])
        : null
    }
  },
  async mounted(
    { proposals, proposalId, governanceParameters, $store } = this
  ) {
    if (!proposals[proposalId]) {
      $store.dispatch(`getProposal`, proposalId)
    }
    if (!governanceParameters.loaded) {
      $store.dispatch(`getGovParameters`)
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
