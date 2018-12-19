<template>
  <page-profile data-title="Proposal"
    ><template slot="menu-body">
      <tm-balance />
    </template>
    <div slot="menu">
      <tool-bar>
        <router-link to="/governance" exact="exact"
          ><i class="material-icons">arrow_back</i></router-link
        >
      </tool-bar>
    </div>
    <tm-data-error v-if="!proposal" />
    <template v-else>
      <div class="page-profile__header page-profile__section proposal">
        <div class="column page-profile__header__info">
          <div class="row page-profile__header__name">
            <div class="top column">
              <div class="page-profile__status-and-title">
                <span
                  v-tooltip.top="status.message"
                  :class="status.color"
                  class="page-profile__status"
                />
                <div class="page-profile__header__name__title">
                  {{ proposal.title }} {{ `(#` + proposalId + `)` }}
                </div>
              </div>
            </div>
            <div class="column page-profile__header__actions">
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
                v-if="
                  proposal.proposal_status === 'Passed' ||
                    proposal.proposal_status === 'Rejected'
                "
                value="Deposit / Vote"
                disabled="disabled"
                color="primary"
              />
            </div>
          </div>
          <div class="row description">
            <p>
              Submitted {{ submittedAgo }}.
              {{
                proposal.proposal_status === `DepositPeriod`
                  ? `Deposit ends ` + depositEndsIn
                  : `Voting started ` + votingStartedAgo
              }}
            </p>
          </div>
          <div class="row page-profile__header__data votes">
            <dl class="colored_dl">
              <dt>Deposit</dt>
              <dd>
                {{
                  proposal.total_deposit[0].amount +
                    ` ` +
                    proposal.total_deposit[0].denom
                }}
              </dd>
            </dl>
            <div class="page-profile__header__data__break" />
            <dl class="colored_dl">
              <dt>Yes</dt>
              <dd>{{ proposal.tally_result.yes }} / {{ yesPercentage }}</dd>
            </dl>
            <dl class="colored_dl">
              <dt>No</dt>
              <dd>{{ proposal.tally_result.no }} / {{ noPercentage }}</dd>
            </dl>
            <dl class="colored_dl">
              <dt>No with Veto</dt>
              <dd>
                {{ proposal.tally_result.no_with_veto }} /
                {{ noWithVetoPercentage }}
              </dd>
            </dl>
            <dl class="colored_dl">
              <dt>Abstain</dt>
              <dd>
                {{ proposal.tally_result.abstain }} / {{ abstainPercentage }}
              </dd>
            </dl>
          </div>
        </div>
      </div>
      <div class="page-profile__details page-profile__section">
        <div class="column">
          <div class="row"><text-block :content="proposal.description" /></div>
        </div>
      </div>
      <modal-deposit
        v-if="showModalDeposit"
        :show-modal-deposit.sync="showModalDeposit"
        :proposal-id="proposalId"
        :proposal-title="proposal.title"
        :denom="bondingDenom"
        @submitDeposit="deposit"
      />
      <modal-vote
        v-if="showModalVote"
        :show-modal-vote.sync="showModalVote"
        :proposal-id="proposalId"
        :proposal-title="proposal.title"
        :last-vote-option="lastVote && lastVote.option"
        @castVote="castVote"
      />
    </template>
  </page-profile>
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
import PageProfile from "common/PageProfile"
export default {
  name: `page-proposal`,
  components: {
    TmBalance,
    TmBtn,
    ModalDeposit,
    ModalVote,
    ToolBar,
    TmDataError,
    PageProfile,
    TextBlock
  },
  props: {
    proposalId: {
      type: String,
      required: true
    }
  },
  data: () => ({
    showModalDeposit: false,
    showModalVote: false,
    lastVote: undefined
  }),
  computed: {
    // TODO: get denom from governance params
    ...mapGetters([
      `bondingDenom`,
      `proposals`,
      `connected`,
      `wallet`,
      `votes`
    ]),
    proposal() {
      let proposal = this.proposals.proposals[this.proposalId]
      if (proposal) {
        proposal.tally_result.yes = Math.round(
          parseFloat(proposal.tally_result.yes)
        )
        proposal.tally_result.no = Math.round(
          parseFloat(proposal.tally_result.no)
        )
        proposal.tally_result.no_with_veto = Math.round(
          parseFloat(proposal.tally_result.no_with_veto)
        )
        proposal.tally_result.abstain = Math.round(
          parseFloat(proposal.tally_result.abstain)
        )
      }
      return proposal
    },
    proposalType() {
      return this.proposal.proposal_type.toLowerCase()
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
        Number(this.proposal.tally_result.yes) +
        Number(this.proposal.tally_result.no) +
        Number(this.proposal.tally_result.no_with_veto) +
        Number(this.proposal.tally_result.abstain)
      )
    },
    yesPercentage() {
      return num.percentInt(this.proposal.tally_result.yes / this.totalVotes)
    },
    noPercentage() {
      return num.percentInt(this.proposal.tally_result.no / this.totalVotes)
    },
    noWithVetoPercentage() {
      return num.percentInt(
        this.proposal.tally_result.no_with_veto / this.totalVotes
      )
    },
    abstainPercentage() {
      return num.percentInt(
        this.proposal.tally_result.abstain / this.totalVotes
      )
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
      this.showModalVote = true

      // The error is already handled with notifyError in votes.js
      await this.$store.dispatch(`getProposalVotes`, this.proposalId)
      this.lastVote =
        this.votes[this.proposalId] &&
        this.votes[this.proposalId].find(e => e.voter === this.wallet.address)
    },
    onDeposit() {
      this.showModalDeposit = true
    },
    async deposit({ amount, password }) {
      try {
        // TODO: support multiple coins
        await this.$store.dispatch(`submitDeposit`, {
          proposal_id: this.proposalId,
          amount,
          password
        })

        // TODO: get min deposit denom from gov params
        this.$store.commit(`notify`, {
          title: `Successful deposit!`,
          body: `You have successfully deposited your ${
            this.bondingDenom
          }s on proposal #${this.proposalId}`
        })
      } catch ({ message }) {
        this.$store.commit(`notifyError`, {
          title: `Error while submitting a deposit on proposal #${
            this.proposalId
          }`,
          body: message
        })
      }
    },
    async castVote({ option, password }) {
      try {
        await this.$store.dispatch(`submitVote`, {
          proposal_id: this.proposalId,
          option,
          password
        })

        this.$store.commit(`notify`, {
          title: `Successful vote!`,
          body: `You have successfully voted ${option} on proposal #${
            this.proposalId
          }`
        })
      } catch ({ message }) {
        this.$store.commit(`notifyError`, {
          title: `Error while voting on proposal #${this.proposalId}`,
          body: message
        })
      }
    }
  }
}
</script>
<style>
.proposal b {
  color: var(--bright);
}

.proposal .page-profile__status {
  position: relative;
  left: 0;
  margin-right: 0.5rem;
}

.proposal .description {
  max-width: 500px;
}

.proposal .votes {
  padding-top: 2rem;
}

.proposal-id {
  color: var(--dim);
  font-size: 14px;
  margin: 0;
  font-weight: 400;
  padding-bottom: 0.25rem;
}

.text-block {
  padding: 0;
}

.row b {
  font-weight: 500;
}
</style>
