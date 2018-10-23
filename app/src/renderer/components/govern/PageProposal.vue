<template lang="pug">
tm-page(data-title='Proposal')
  div(slot="menu"): vm-tool-bar
    a(@click="commentOnProposal(proposal.proposal_id)"): i.material-icons comment
    a(@click="proposalIsSpam(proposal.proposal_id)"): i.material-icons error

  tm-part(v-if="proposal.type === 'Text' && proposal.proposal_status === 'VotingPeriod'")
    div(slot='title') Proposed by #[router-link(:to="{ name: 'delegate', params: { delegate: proposal.proposer }}") {{ proposal.proposer }}]
    text-block(:content="proposal.title")

tm-part(title='Time to vote: 13D 23H 27M' v-if="proposal.proposal_status === 'VotingPeriod'"): tm-form-struct(:submit='confirmVote')
    field-vote(@click.native="vote('yes')" dt='Yes' :dd='yesPct'
      color='hsl(120,50%,35%)' :active="votePick === 'yes'" :results="voteVisible")

    field-vote(@click.native="vote('no')" dt='No' :dd="noPct"
      color='hsl(0,50%,35%)' :active="votePick === 'no'" :results="voteVisible")

    field-vote(@click.native="vote('no_with_veto')" dt='No with veto' :dd="noWithVetoPct"
      color='hsl(330,50%,35%)' :active="votePick === 'no_with_veto'" :results="voteVisible")

    field-vote(@click.native="vote('abstain')" dt='Abstain' :dd="abstainPct"
      color='hsl(0,0%,35%)' :active="votePick === 'abstain'" :results="voteVisible")

    div(slot='footer')
      tm-btn(theme='cosmos' type='button' @click.native="toggleVoteVisible" value='Toggle Results')
      tm-btn(theme='cosmos' type='submit' value='Confirm Vote')
</template>

<script>
import { mapGetters } from "vuex"
import { TmBtn, TmFormStruct, TmPage, TmPart } from "@tendermint/ui"
import FieldVote from "common/TmFieldVote"
import TextBlock from "common/TextBlock"
import VmToolBar from "common/VmToolBar"
export default {
  name: `page-proposal`,
  components: {
    TmBtn,
    FieldVote,
    TmFormStruct,
    TmPage,
    TmPart,
    TextBlock,
    VmToolBar
  },
  computed: {
    ...mapGetters([`proposals`]),
    proposal() {
      if (this.proposals) {
        return this.proposals[this.$route.params.proposal]
      } else {
        return {}
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
    yesPct() {
      return this.proposal.tally_result.yes / this.totalVotes
    },
    noPct() {
      return this.proposal.tally_result.no / this.totalVotes
    },
    noWithVetoPct() {
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
