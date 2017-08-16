<template lang="pug">
page(:title='proposal.title')
  tool-bar
    router-link(to="/" exact): i.material-icons arrow_back
    a(@click="commentOnProposal(proposal.id)"): i.material-icons comment
    a(@click="proposalIsSpam(proposal.id)"): i.material-icons error

  part(v-if="proposal.type === 'text'")
    div(slot='title') Proposed by #[router-link(:to="{ name: 'delegator', params: { delegator: proposal.validatorId }}") {{ proposal.validatorId }}]
    proposal-text(:content="proposal.data.text")

  part(title='Time to vote: 13D 23H 27M'): form-struct(:submit='confirmVote')
    field-vote(@click.native="vote('yes')" dt='Yes' :dd='yesPct'
      color='hsl(120,50%,35%)' :active="votePick === 'yes'")

    field-vote(@click.native="vote('no')" dt='No' :dd="noPct"
      color='hsl(0,50%,35%)' :active="votePick === 'no'")

    field-vote(@click.native="vote('reject')" dt='Reject' :dd="rejectPct"
      color='hsl(330,50%,35%)' :active="votePick === 'reject'")

    field-vote(@click.native="vote('abstain')" dt='Abstain' :dd="abstainPct"
      color='hsl(0,0%,35%)' :active="votePick === 'abstain'")
    div(slot='footer')
      div
      btn(theme='cosmos' type='submit' value='Confirm Vote')
</template>

<script>
import { mapGetters } from 'vuex'
import Btn from '@nylira/vue-button'
import FieldVote from '../common/NiFieldVote'
import FormStruct from '../common/NiFormStruct'
import Page from '../common/NiPage'
import Part from '../common/NiPart'
import ProposalText from './ProposalText'
import ToolBar from '../common/NiToolBar'
export default {
  name: 'page-proposal',
  components: {
    Btn,
    FieldVote,
    FormStruct,
    Page,
    Part,
    ProposalText,
    ToolBar
  },
  computed: {
    ...mapGetters(['proposals']),
    proposal () {
      if (this.proposals && this.proposals.length > 0) {
        return this.proposals.find(p => p.id === this.$route.params.proposal)
      } else {
        return this.emptyProposal
      }
    },
    totalVotes () {
      return this.proposal.votes.yes +
        this.proposal.votes.no +
        this.proposal.votes.reject +
        this.proposal.votes.abstain
    },
    yesPct () { return this.proposal.votes.yes / this.totalVotes },
    noPct () { return this.proposal.votes.no / this.totalVotes },
    rejectPct () { return this.proposal.votes.reject / this.totalVotes },
    abstainPct () { return this.proposal.votes.abstain / this.totalVotes }
  },
  created () {
    this.$watch('$route.params', this.refreshProposal)
  },
  data: () => ({
    emptyProposal: {
      id: '',
      active_at: '',
      created_at: '',
      entity_id: '',
      title: 'Loading',
      type: '',
      flags: {
        passed: false
      },
      data: {
        body: '',
        old_members: '',
        new_members: ''
      },
      vote_id: 0
    },
    votePick: 'abstain'
  }),
  methods: {
    vote (choice, $event) {
      this.votePick = choice
      // console.log('votePick', this.votePick)
    },
    confirmVote () {
      this.$store.commit('notify', { title: `Voted '${this.votePick}'`,
        body: 'Your vote has been submitted.'})
    },
    refreshProposal () {
      if (this.rawProposal) {
        this.proposal = this.rawProposal
      } else {
        this.proposal = this.emptyProposal
      }
    },
    commentOnProposal (proposalId) {
      this.$store.commit('notify', { title: 'View Discussion Thread',
        body: `TODO: Discuss ${proposalId} proposal on the forum.`})
    },
    proposalIsSpam (proposalId) {
      this.$store.commit('notify', { title: 'Mark Proposal As Spam',
        body: `TODO: Mark ${proposalId} proposal as a spam attack.`})
    }
    /* ,
    deleteProposal (proposal) {
      this.$router.push('/proposals')
      this.$store.commit('RM_PROPOSAL', proposal)
      this.$store.commit('RM_VOTES_BY_PROPOSAL', proposal.vote_id)
      this.$store.commit('RM_MSGS_BY_PROPOSAL', proposal.id)
    }
    */
  }
}
</script>
