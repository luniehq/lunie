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
            tm-btn#vote-btn(v-if="status.button === 'vote'" value="Vote" color="primary" @click.native="onVote")
            tm-btn#deposit-btn(v-if="status.button === 'deposit'" value="Deposit" color="primary" @click.native="onDeposit")
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

    modal-deposit(
      v-if="showModalDeposit"
      v-on:submitDeposit="deposit"
      :showModalDeposit.sync="showModalDeposit"
      :proposalId="proposal.proposal_id"
      :proposalTitle="proposal.title"
      :denom="bondingDenom.toLowerCase()"
    )

    modal-vote(
      v-if="showModalVote"
      v-on:castVote="castVote"
      :showModalVote.sync="showModalVote"
      :proposalId="proposal.proposal_id"
      :proposalTitle="proposal.title"
    )
</template>

<script>
import { mapGetters } from "vuex"
import num from "scripts/num"
import { TmBtn, TmPage, TmToolBar } from "@tendermint/ui"
import TmBalance from "common/TmBalance"
import FieldVote from "common/TmFieldVote"
import TextBlock from "common/TextBlock"
import ModalDeposit from "./ModalDeposit"
import ModalVote from "./ModalVote"
export default {
  name: `page-proposal`,
  props: [`proposal`, `status`],
  components: {
    TmBalance,
    TmBtn,
    FieldVote,
    ModalDeposit,
    ModalVote,
    TmToolBar,
    TmPage,
    TextBlock
  },
  data: () => ({
    showModalDeposit: false,
    showModalVote: false
  }),
  computed: {
    // TODO: get denom from governance params
    ...mapGetters([`bondingDenom`]),
    proposalType() {
      return this.proposal.proposal_type.toLowerCase()
    },
    submitBlock() {
      return `#` + num.prettyInt(this.proposal.submit_block)
    },
    voteBlock() {
      if (this.proposal.submit_block === this.proposal.voting_start_block)
        return `the same block`
      else {
        return `block #` + num.prettyInt(this.proposal.voting_start_block)
      }
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
      let proposalId = this.proposal.proposal_id

      try {
        // TODO: support multiple coins
        await this.$store.dispatch(`submitDeposit`, { proposalId, amount })

        // TODO: get min deposit denom from gov params
        this.$store.commit(`notify`, {
          title: `Successful deposit!`,
          body: `You have successfully deposited your ${this.bondingDenom.toLowerCase()}s on proposal #${
            this.proposal.proposal_id
          }`
        })
      } catch ({ message }) {
        this.$store.commit(`notifyError`, {
          title: `Error while submitting a deposit on proposal #${
            this.proposal.proposal_id
          }`,
          body: message
        })
      }
    },
    async castVote({ option }) {
      let proposalId = this.proposal.proposal_id

      try {
        await this.$store.dispatch(`submitVote`, { proposalId, option })

        this.$store.commit(`notify`, {
          title: `Successful vote!`,
          body: `You have successfully voted ${option} on proposal #${
            this.proposal.proposal_id
          }`
        })
      } catch ({ message }) {
        this.$store.commit(`notifyError`, {
          title: `Error while voting on proposal #${this.proposal.proposal_id}`,
          body: message
        })
      }
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
