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
              .validator-profile__header__name__title {{ proposal.title }}
          .column.validator-profile__header__actions
            tm-btn(v-if="status.button === 'vote'" value="Vote" color="primary")
            tm-btn(v-if="status.button === 'deposit'" value="Deposit" color="primary")
            tm-btn(v-if="!status.button" disabled value="Deposit / Vote" color="primary")

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
import num from "scripts/num"
import { TmBtn, TmPage, TmToolBar } from "@tendermint/ui"
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
    TmToolBar,
    TmPage,
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
    status() {
      switch (this.proposal.proposal_status) {
        case `Passed`:
          return {
            button: null,
            message: `This proposal has passed`,
            color: `green`
          }
          break
        case `Rejected`:
          return {
            button: null,
            message: `This proposal has been rejected and voting is closed`,
            color: `red`
          }
          break
        case `Active`:
          return {
            button: `vote`,
            message: `Voting for this proposal is open`,
            color: `blue`
          }
          break
        case `Pending`:
          return {
            button: `deposit`,
            message: `Deposits are open for this proposal`,
            color: `yellow`
          }
          break
        default:
          return {
            button: null,
            message: `There was an error determining the status of this proposal`,
            color: `grey`
          }
      }
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
