<template>
  <TmPage data-title="Proposal" :loading="$apollo.queries.proposal.loading">
    <TmDataNotFound v-if="!found" />
    <div v-else class="proposal">
      <ProposalHeader
        :title="proposal.title"
        :type="proposal.type"
        :proposer="proposal.proposer.address"
        :status="status"
        @open-vote-modal="onVote"
        @open-deposit-modal="onDeposit"
      />

      <ProposalStatusBar
        :status="status.badge"
        :status-begin-time="proposal.statusBeginTime"
        :total-votes="proposal.tally.total"
        :proposal-id="proposal.proposalId"
        :vote-percentage="proposal.tally.totalVotedPercentage"
        :yes-votes="Number(proposal.tally.yes)"
        :no-votes="Number(proposal.tally.no)"
        :veto-votes="Number(proposal.tally.veto)"
        :abstain-votes="Number(proposal.tally.abstain)"
        :deposit-total="proposal.detailedVotes.depositsSum"
      />

      <ParticipantList
        v-if="
          proposal.detailedVotes.votes &&
          proposal.detailedVotes.votes.length > 0
        "
        :participants="proposal.detailedVotes.votes.map(({ voter }) => voter)"
      />

      <template v-if="proposal.detailedVotes.timeline">
        <Timeline :timeline="proposal.detailedVotes.timeline" />
      </template>

      <ProposalDescription
        :description="proposal.description"
        :type="proposal.type"
        :supporting-links="proposal.detailedVotes.links"
      />

      <ModalDeposit
        v-if="parameters.depositDenom"
        ref="modalDeposit"
        :proposal-id="proposalId"
        :proposal-title="proposal.title || ''"
        :denom="parameters.depositDenom"
        @success="() => afterDeposit()"
      />
      <ModalVoteSubstrate
        v-if="currentNetwork.network_type === `polkadot`"
        ref="modalVote"
        :proposal-id="proposal.proposalId"
        :proposal-title="proposal.title || ''"
        :last-vote-option="vote"
        @success="() => afterVote()"
      />
      <ModalVote
        v-else
        ref="modalVote"
        :proposal-id="proposalId"
        :proposal-title="proposal.title || ''"
        :last-vote-option="vote"
        @success="() => afterVote()"
      />
    </div>
  </TmPage>
</template>

<script>
import { mapGetters } from "vuex"
import { percent, prettyInt } from "scripts/num"
import { date, fromNow } from "src/filters"
import TmDataNotFound from "common/TmDataNotFound"
import ModalDeposit from "src/ActionModal/components/ModalDeposit"
import ModalVote from "src/ActionModal/components/ModalVote"
import ModalVoteSubstrate from "src/ActionModal/components/ModalVoteSubstrate"
import TmPage from "common/TmPage"
import ParticipantList from "governance/ParticipantList"
import ProposalHeader from "governance/ProposalHeader"
import ProposalStatusBar from "governance/ProposalStatusBar"
import ProposalDescription from "governance/ProposalDescription"
import Timeline from "governance/Timeline"
import { getProposalStatus } from "scripts/proposal-status"
import { ProposalItem, GovernanceParameters, Vote } from "src/gql"
import BigNumber from "bignumber.js"
import gql from "graphql-tag"

export default {
  name: `page-proposal`,
  components: {
    ModalDeposit,
    ModalVote,
    ModalVoteSubstrate,
    TmDataNotFound,
    TmPage,
    ParticipantList,
    ProposalHeader,
    ProposalDescription,
    ProposalStatusBar,
    Timeline,
  },
  filters: {
    prettyInt,
    percent,
    date,
    fromNow,
    lowerCase: (text) => (text ? text.toLowerCase() : ""),
  },
  props: {
    proposalId: {
      type: String,
      required: true,
    },
  },
  data: () => ({
    proposals: [],
    vote: undefined,
    proposal: {
      status: "",
      proposer: "",
      tally: {},
      validator: {},
    },
    parameters: {
      depositDenom: "",
    },
    error: undefined,
    found: false,
    loaded: false,
  }),
  computed: {
    ...mapGetters([`address`, `network`, `currentNetwork`]),
    status() {
      return getProposalStatus(this.proposal)
    },
    noVotes() {
      return BigNumber(this.proposal.tally.total).eq(0)
    },
  },
  methods: {
    onVote() {
      this.$refs.modalVote.open()
    },
    afterVote() {
      this.$apollo.queries.vote.refetch()
    },
    onDeposit() {
      this.$refs.modalDeposit.open()
    },
    afterDeposit() {
      this.$apollo.queries.proposal.refetch()
    },
  },
  apollo: {
    proposal: {
      /* istanbul ignore next */
      query() {
        return ProposalItem(this.network)
      },
      /* istanbul ignore next */
      update(data) {
        this.loaded = true
        if (data.proposal) this.found = true
        return data.proposal || {}
      },
      /* istanbul ignore next */
      variables() {
        return {
          id: this.proposalId,
        }
      },
      /* istanbul ignore next */
      result(data) {
        if (data.proposal) this.found = true
        this.error = data.error
      },
    },
    parameters: {
      /* istanbul ignore next */
      query() {
        return GovernanceParameters(this.network)
      },
      /* istanbul ignore next */
      update(data) {
        return data.governanceParameters || {}
      },
      /* istanbul ignore next */
      skip() {
        // only Tendermint networks have this network-wide "governance parameters" logic
        return !this.found || this.currentNetwork.network_type !== `cosmos`
      },
      /* istanbul ignore next */
      result(data) {
        this.error = data.error
      },
    },
    vote: {
      /* istanbul ignore next */
      query() {
        return Vote(this.network)
      },
      /* istanbul ignore next */
      variables() {
        return {
          proposalId: this.proposalId,
          address: this.address,
        }
      },
      /* istanbul ignore next */
      skip() {
        return !this.address || !this.found
      },
      update(data) {
        if (data.vote) return data.vote.option
        return undefined
      },
      /* istanbul ignore next */
      result(data) {
        this.error = data.error
      },
    },
    $subscribe: {
      blockAdded: {
        /* istanbul ignore next */
        variables() {
          return {
            networkId: this.network,
          }
        },
        /* istanbul ignore next */
        query() {
          return gql`
            subscription($networkId: String!) {
              blockAdded(networkId: $networkId) {
                height
              }
            }
          `
        },
        /* istanbul ignore next */
        skip() {
          return !this.found
        },
        /* istanbul ignore next */
        result() {
          if (
            // Don't update passed or rejected proposals
            this.proposal.status !== "Passed" &&
            this.proposal.status !== "Rejected" &&
            this.loaded
          ) {
            this.$apollo.queries.proposal.refetch()
            this.$apollo.queries.parameters.refetch()
            this.$apollo.queries.vote.refetch()
          }
        },
      },
    },
  },
}
</script>
<style scoped>
.proposal {
  padding: 0 1rem;
}
</style>
