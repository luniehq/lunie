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
              span.validator-profile__status(v-bind:class="statusColor" v-tooltip.top="status")
              .validator-profile__header__name__title {{ proposal.title }}
          .column.validator-profile__header__actions
            tm-btn(v-if="button === 'vote'" value="Vote" color="primary" @click.native="vote")
            tm-btn(v-if="button === 'deposit'" value="Deposit" color="primary" @click.native="deposit")
            tm-btn(v-if="!button" disabled value="Deposit / Vote" color="primary")

        .row.description
          p This {{ proposalType }} proposal ({{ `#` + proposal.proposal_id }}) was submitted at block {{ submitBlock }} and voting started at {{ voteBlock }}.

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
</template>

<script>
import { mapGetters } from "vuex"
import num from "scripts/num"
import { TmBtn, TmFormStruct, TmPage, TmPart, TmToolBar } from "@tendermint/ui"
import TmBalance from "common/TmBalance"
import FieldVote from "common/TmFieldVote"
import TextBlock from "common/TextBlock"
export default {
  name: `page-proposal`,
  props: [`proposal`],
  components: {
    TmBalance,
    TmBtn,
    FieldVote,
    TmFormStruct,
    TmPage,
    TmPart,
    TextBlock
  },
  computed: {
    proposalType() {
      return this.proposal.proposal_type.toLowerCase()
    },
    submitBlock() {
      return `#` + num.prettyInt(this.proposal.submit_block)
    },
    voteBlock() {
      if (this.proposal.submit_block === this.proposal.voting_start_block) {
        return `the same block`
      } else {
        return `block #` + num.prettyInt(this.proposal.voting_start_block)
      }
    },
    button() {
      if (this.proposal.proposal_status === "Passed") return null

      if (this.proposal.proposal_status === "Rejected") return null

      if (this.proposal.proposal_status === "Active") return `vote`

      if (this.proposal.proposal_status === "Pending") return `deposit`
    },
    status() {
      if (this.proposal.proposal_status === "Passed")
        return `This proposal has passed`

      if (this.proposal.proposal_status === "Rejected")
        return `This proposal has been rejected and voting is closed`

      if (this.proposal.proposal_status === "Active")
        return `Voting for this proposal is open`

      if (this.proposal.proposal_status === "Pending")
        return `Deposits are open for this proposal`
    },
    statusColor() {
      if (this.proposal.proposal_status === "Passed") return `green`
      if (this.proposal.proposal_status === "Rejected") return `red`
      if (this.proposal.proposal_status === "Active") return `blue`
      if (this.proposal.proposal_status === "Pending") return `yellow`
    },
    totalVotes() {
      return (
        this.proposal.tally_result.yes +
        this.proposal.tally_result.no +
        this.proposal.tally_result.no_with_veto +
        this.proposal.tally_result.abstain
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
    }
  },
  data: () => ({
    votePick: `abstain`,
    voteVisible: false
  }),
  methods: {
    vote(choice) {
      this.votePick = choice
    },
    confirmVote() {
      this.$store.commit(`notify`, {
        title: `Voted '${this.votePick}'`,
        body: `Your vote has been submitted.`
      })
    },
    commentOnProposal(proposalId) {
      this.$store.commit(`notify`, {
        title: `View Discussion Thread`,
        body: `TODO: Discuss ${proposalId} proposal on the forum.`
      })
    },
    proposalIsSpam(proposalId) {
      this.$store.commit(`notify`, {
        title: `Mark Proposal As Spam`,
        body: `TODO: Mark ${proposalId} proposal as a spam attack.`
      })
    },
    toggleVoteVisible() {
      this.voteVisible = !this.voteVisible
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
