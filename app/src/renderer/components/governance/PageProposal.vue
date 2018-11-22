<template lang="pug">
tm-page(data-title='Proposal')
  template(slot="menu-body"): tm-balance
  div(slot="menu"): tm-tool-bar
    router-link(to="/governance" exact): i.material-icons arrow_back

  tm-data-error(v-if="!proposal")

  template(v-else)
    .validator-profile__header.validator-profile__section.proposal
      .column.validator-profile__header__info
        .row.validator-profile__header__name
          .top.column
            div.validator-profile__status-and-title
              span.validator-profile__status(v-bind:class="status.color" v-tooltip.top="status.message")
              .validator-profile__header__name__title {{ proposal.title }} {{ `(#` + proposalId + `)`}}
          .column.validator-profile__header__actions
            tm-btn#vote-btn(v-if="status.button === 'vote'" value="Vote" color="primary" @click.native="onVote")
            tm-btn#deposit-btn(v-if="status.button === 'deposit'" value="Deposit" color="primary" @click.native="onDeposit")
            tm-btn(v-if="!status.button" disabled value="Deposit / Vote" color="primary")

        .row.description
          p Submitted {{ submittedAgo }}. {{ proposal.proposal_status === `DepositPeriod` ? `Deposit ends ` + depositEndsIn : `Voting started ` + votingStartedAgo }}

        .row.validator-profile__header__data.votes
          dl.colored_dl
            dt Deposit
            dd {{ proposal.total_deposit[0].amount + ` ` + proposal.total_deposit[0].denom }}
          .validator-profile__header__data__break
          dl.colored_dl
            dt Yes
            dd {{ proposal.tally_result.yes }} / {{ yesPercentage }}
          dl.colored_dl
            dt No
            dd {{ proposal.tally_result.no }} / {{ noPercentage }}
          dl.colored_dl
            dt No with Veto
            dd {{ proposal.tally_result.no_with_veto }} / {{ noWithVetoPercentage }}
          dl.colored_dl
            dt Abstain
            dd {{ proposal.tally_result.abstain }} / {{ abstainPercentage }}

    .validator-profile__details.validator-profile__section
      .column
        .row
          text-block(:content="proposal.description")

    modal-deposit(
      v-if="showModalDeposit"
      v-on:submitDeposit="deposit"
      :showModalDeposit.sync="showModalDeposit"
      :proposalId="proposalId"
      :proposalTitle="proposal.title"
      :denom="bondingDenom.toLowerCase()"
    )

    modal-vote(
      v-if="showModalVote"
      v-on:castVote="castVote"
      :showModalVote.sync="showModalVote"
      :proposalId="proposalId"
      :proposalTitle="proposal.title"
    )
</template>

<script>
import moment from "moment"
import { mapGetters } from "vuex"
import num from "scripts/num"
import { TmBtn, TmPage, TmToolBar } from "@tendermint/ui"
import TmBalance from "common/TmBalance"
import TmDataError from "common/TmDataError"
import TextBlock from "common/TextBlock"
import ModalDeposit from "./ModalDeposit"
import ModalVote from "./ModalVote"
export default {
  name: `page-proposal`,
  components: {
    TmBalance,
    TmBtn,
    ModalDeposit,
    ModalVote,
    TmToolBar,
    TmDataError,
    TmPage,
    TextBlock
  },
  props: [`proposalId`],
  data: () => ({
    showModalDeposit: false,
    showModalVote: false
  }),
  computed: {
    // TODO: get denom from governance params
    ...mapGetters([`bondingDenom`, `proposals`]),
    proposal() {
      let proposal = this.proposals[this.proposalId]
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
      return proposal
    },
    proposalType() {
      return this.proposal.proposal_type.toLowerCase()
    },
    submittedAgo() {
      return moment(new Date(this.proposal.submit_time)).fromNow()
    },
    votingStartedAgo() {
      return moment(new Date(this.proposal.voting_start_block)).fromNow()
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
          button: null,
          message: `This proposal has passed`,
          color: `green`
        }
      if (this.proposal.proposal_status === `Rejected`)
        return {
          button: null,
          message: `This proposal has been rejected and voting is closed`,
          color: `red`
        }
      if (this.proposal.proposal_status === `DepositPeriod`)
        return {
          button: `deposit`,
          message: `Deposits are open for this proposal`,
          color: `yellow`
        }
      if (this.proposal.proposal_status === `VotingPeriod`)
        return {
          button: `vote`,
          message: `Voting for this proposal is open`,
          color: `blue`
        }
      else
        return {
          button: null,
          message: `There was an error determining the status of this proposal.`,
          color: `grey`
        }
    }
  },
  methods: {
    onVote() {
      this.showModalVote = true
    },
    onDeposit() {
      this.showModalDeposit = true
    },
    async deposit({ amount }) {
      try {
        // TODO: support multiple coins
        await this.$store.dispatch(`submitDeposit`, {
          proposal_id: this.proposalId,
          amount
        })

        // TODO: get min deposit denom from gov params
        this.$store.commit(`notify`, {
          title: `Successful deposit!`,
          body: `You have successfully deposited your ${this.bondingDenom.toLowerCase()}s on proposal #${
            this.proposalId
          }`
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
    async castVote({ option }) {
      try {
        await this.$store.dispatch(`submitVote`, {
          proposal_id: this.proposalId,
          option
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
  },
  watch: {
    "$route.params.proposal"(updatedProposal) {
      this.proposal = updatedProposal
    },
    "$route.params.status"(updatedStatus) {
      this.proposal = updatedStatus
    }
  }
}
</script>
<style lang="stylus">
@require '~variables';
.proposal
  b
    color var(--bright)

  .validator-profile__status
    position relative
    left 0
    margin-right 0.5rem

  .description
    max-width 500px

  .votes
    padding-top 2rem

.proposal-id
  color var(--dim)
  font-size 14px
  margin 0
  font-weight 400
  padding-bottom 0.25rem

.text-block
  padding 0

.row b
  font-weight 500
</style>
