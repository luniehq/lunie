<template lang="pug">
tm-page(:title='proposal.title')
  div(slot="menu"): tool-bar
    a(@click="commentOnProposal(proposal.id)"): i.material-icons comment
    a(@click="proposalIsSpam(proposal.id)"): i.material-icons error

  tm-part(v-if="proposal.type === 'text'")
    div(slot='title') Proposed by #[router-link(:to="{ name: 'delegate', params: { delegate: proposal.validatorId }}") {{ proposal.validatorId }}]
    text-block(:content="proposal.data.text")

  tm-part(title='Time to vote: 13D 23H 27M'): tm-form-struct(:submit='confirmVote')
    field-vote(@click.native="vote('yes')" dt='Yes' :dd='yesPct'
      color='hsl(120,50%,35%)' :active="votePick === 'yes'" :results="voteVisible")

    field-vote(@click.native="vote('no')" dt='No' :dd="noPct"
      color='hsl(0,50%,35%)' :active="votePick === 'no'" :results="voteVisible")

    field-vote(@click.native="vote('reject')" dt='Reject' :dd="rejectPct"
      color='hsl(330,50%,35%)' :active="votePick === 'reject'" :results="voteVisible")

    field-vote(@click.native="vote('abstain')" dt='Abstain' :dd="abstainPct"
      color='hsl(0,0%,35%)' :active="votePick === 'abstain'" :results="voteVisible")

    div(slot='footer')
      tm-btn(theme='cosmos' type='button' @click.native="toggleVoteVisible" value='Toggle Results')
      tm-btn(theme='cosmos' type='submit' value='Confirm Vote')
</template>

<script>
import { mapGetters } from "vuex"
import { TmBtn, TmFormStruct, TmPage, TmPart } from "@tendermint/ui"
import FieldVote from "common/NiFieldVote"
import TextBlock from "common/TextBlock"
import ToolBar from "common/VrToolBar"
export default {
  name: "page-proposal",
  components: {
    TmBtn,
    FieldVote,
    TmFormStruct,
    TmPage,
    TmPart,
    TextBlock,
    ToolBar
  },
  computed: {
    ...mapGetters(["proposals"]),
    proposal() {
      if (this.proposals) {
        return this.proposals.items.find(
          p => p.id === this.$route.params.proposal
        )
      } else {
        return {}
      }
    },
    totalVotes() {
      return (
        this.proposal.votes.yes +
        this.proposal.votes.no +
        this.proposal.votes.reject +
        this.proposal.votes.abstain
      )
    },
    yesPct() {
      return this.proposal.votes.yes / this.totalVotes
    },
    noPct() {
      return this.proposal.votes.no / this.totalVotes
    },
    rejectPct() {
      return this.proposal.votes.reject / this.totalVotes
    },
    abstainPct() {
      return this.proposal.votes.abstain / this.totalVotes
    }
  },
  data: () => ({
    votePick: "abstain",
    voteVisible: false
  }),
  methods: {
    vote(choice, $event) {
      this.votePick = choice
    },
    confirmVote() {
      this.$store.commit("notify", {
        title: `Voted '${this.votePick}'`,
        body: "Your vote has been submitted."
      })
    },
    commentOnProposal(proposalId) {
      this.$store.commit("notify", {
        title: "View Discussion Thread",
        body: `TODO: Discuss ${proposalId} proposal on the forum.`
      })
    },
    proposalIsSpam(proposalId) {
      this.$store.commit("notify", {
        title: "Mark Proposal As Spam",
        body: `TODO: Mark ${proposalId} proposal as a spam attack.`
      })
    },
    toggleVoteVisible() {
      this.voteVisible = !this.voteVisible
    }
  }
}
</script>
