<template>
  <TmPage data-title="Proposal" hide-header>
    <TmDataLoading v-if="!proposals.loaded || !governanceParameters.loaded" />
    <TmDataError v-else-if="!proposal" />
    <template v-else>
      <div class="page-profile__header page-profile__section proposal">
        <div class="row">
          <div class="page-profile__header__info">
            <span :class="status.color" class="proposal-status">{{
              status.badge
            }}</span>
            <div class="page-profile__status-and-title">
              <h2 class="page-profile__title">
                {{ title }}
              </h2>
            </div>
          </div>
        </div>
        <div class="row">
          <dl>
            <dt>Submitted</dt>
            <dd>{{ submittedAgo }}</dd>
          </dl>

          <dl>
            <dt>Voting Start Date</dt>
            <dd>
              {{ votingStartedAgo }}
            </dd>
          </dl>
          <dl v-if="displayEndDate">
            <dt>Voting End Date</dt>
            <dd>{{ endDate }}</dd>
          </dl>
        </div>
      </div>

      <div class="page-profile__section">
        <div class="row">
          <dl v-if="proposal.proposal_status === 'DepositPeriod'">
            <dt>Deposit Count</dt>
            <dd>
              {{ totalDeposit ? totalDeposit.amount : `0` }}
              /
              {{
                num.atoms(
                  governanceParameters.parameters.deposit.min_deposit[0].amount
                )
              }}
              {{ totalDeposit.denom }}
            </dd>
          </dl>
          <dl v-if="proposal.proposal_status !== `DepositPeriod`">
            <dt>Total Vote Count</dt>
            <dd>
              {{ num.shortDecimals(num.atoms(totalVotes)) }}
            </dd>
          </dl>
          <dl>
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
          </dl>
        </div>
        <div v-if="proposal.proposal_status !== `DepositPeriod`" class="row">
          <dl>
            <dt>Yes</dt>
            <dd>
              {{ num.shortDecimals(num.atoms(tally.yes)) }}
              ({{ yesPercentage }})
            </dd>
          </dl>
          <dl>
            <dt>No</dt>
            <dd>
              {{ num.shortDecimals(num.atoms(tally.no)) }}
              ({{ noPercentage }})
            </dd>
          </dl>
          <dl>
            <dt>No with Veto</dt>
            <dd>
              {{ num.shortDecimals(num.atoms(tally.no_with_veto)) }}
              ({{ noWithVetoPercentage }})
            </dd>
          </dl>
          <dl>
            <dt>Abstain</dt>
            <dd>
              {{ num.shortDecimals(num.atoms(tally.abstain)) }}
              ({{ abstainPercentage }})
            </dd>
          </dl>
        </div>
        <div class="row">
          <div class="column">
            <dl>
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
      `session`,
      `pool`
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
      return moment(proposal.submit_time).format("MMMM Do YYYY, HH:mm")
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
      return moment(proposal.voting_start_time).format("MMMM Do YYYY, HH:mm")
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
