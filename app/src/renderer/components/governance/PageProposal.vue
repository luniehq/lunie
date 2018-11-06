<template lang="pug">
tm-page(data-title='Proposal')
  template(slot="menu-body"): tm-balance
  div(slot="menu"): tm-tool-bar
    router-link(to="/governance" exact): i.material-icons arrow_back

  tm-data-error(v-if="!proposal")

  template(v-else)
    .validator-profile__header.validator-profile__section
      .column.validator-profile__header__info
        .row.validator-profile__header__name
          .column
            div.validator-profile__status-and-title
              span.validator-profile__status(v-bind:class="statusColor" v-tooltip.top="status")
              .validator-profile__header__name__title {{ proposal.title }}
            div {{ proposal.proposal_id }}
          .column.validator-profile__header__actions
            tm-btn#delegation-btn(value="Vote" color="primary" @click.native="onDelegation")
</template>

<script>
import { mapGetters } from "vuex"
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
    // proposal() {
    //   console.log(this.$route.params)
    //   return this.$route.params
    // },
    totalVotes() {
      return (
        this.proposal.tally_result.yes +
        this.proposal.tally_result.no +
        this.proposal.tally_result.no_with_veto +
        this.proposal.tally_result.abstain
      )
    },
    yesPct() {
      return this.proposal.tally_result.yes / this.totalVotes
    },
    noPct() {
      return this.proposal.tally_result.no / this.totalVotes
    },
    rejectPct() {
      return this.proposal.tally_result.no_with_veto / this.totalVotes
    },
    abstainPct() {
      return this.proposal.tally_result.abstain / this.totalVotes
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
