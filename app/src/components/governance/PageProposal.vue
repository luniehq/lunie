<template>
  <TmPage data-title="Proposal" :loading="$apollo.queries.proposal.loading">
    <TmDataNotFound v-if="!found" />
    <div v-else class="proposal">
      <ProposalHeader
        :proposal="proposal"
        :status="status"
        @open-vote-modal="onVote"
        @open-deposit-modal="onDeposit"
      />

      <ProposalStatusBar
        v-if="tallyHasValues"
        :status="status"
        :status-begin-time="proposal.statusBeginTime"
        :total-votes="proposal.tally.total"
        :proposal="proposal"
      />

      <ParticipantList
        v-if="participants"
        :participants="participants"
        :show-amounts="true"
      />

      <template v-if="proposal.detailedVotes.timeline.length">
        <Timeline :timeline="proposal.detailedVotes.timeline" />
      </template>

      <ProposalDescription
        :proposal="proposal"
        :supporting-links="proposal.detailedVotes.links"
      />

      <ModalDeposit
        v-if="status.value === governanceStatusEnum.DEPOSITING"
        ref="modalDeposit"
        :proposal-id="
          currentNetwork.network_type === `polkadot`
            ? proposal.proposalId
            : proposalId
        "
        :proposal-title="proposal.title || ''"
        :denom="parameters.depositDenom || currentNetwork.stakingDenom"
        :deposits="proposal.detailedVotes.deposits"
        @success="() => afterDeposit()"
      />
      <ModalVotePolkadot
        v-if="
          currentNetwork.network_type === `polkadot` &&
          status.value === governanceStatusEnum.VOTING
        "
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
        :number-of-seconds="
          isPolkadotDemocracy ? Number(proposal.detailedVotes.votesSum) : 0
        "
        @success="() => afterVote()"
      />
    </div>
  </TmPage>
</template>

<script>
import { mapGetters } from "vuex"
import { percent, prettyInt } from "scripts/num"
import { governanceStatusEnum } from "scripts/proposal-status"
import { date, fromNow } from "src/filters"
import TmDataNotFound from "common/TmDataNotFound"
import ModalDeposit from "src/ActionModal/components/ModalDeposit"
import ModalVote from "src/ActionModal/components/ModalVote"
import ModalVotePolkadot from "src/ActionModal/components/ModalVotePolkadot"
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
    ModalVotePolkadot,
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
    governanceStatusEnum,
  }),
  computed: {
    ...mapGetters([`address`, `network`, `currentNetwork`]),
    proposalId() {
      return this.$route.params.proposalId
    },
    status() {
      return getProposalStatus(this.proposal)
    },
    noVotes() {
      return BigNumber(this.proposal.tally.total).eq(0)
    },
    tallyHasValues() {
      return Object.values(this.proposal.tally)
        .filter((value) => value !== `Tally`)
        .find((value) => value)
    },
    isPolkadotDemocracy() {
      return (
        this.currentNetwork.network_type === `polkadot` &&
        this.status.value === governanceStatusEnum.DEPOSITING
      )
    },
    participants() {
      if (
        this.proposal.detailedVotes.votes &&
        this.proposal.detailedVotes.votes.length > 0
      ) {
        return this.proposal.detailedVotes.votes.map((vote) => ({
          ...vote.voter,
          amount: vote.amount,
          option: vote.option,
        }))
      } else if (
        this.proposal.detailedVotes.deposits &&
        this.proposal.detailedVotes.deposits.length > 0
      ) {
        // a bit hacky but working
        return this.proposal.detailedVotes.deposits.map((deposit) => ({
          ...deposit.depositer,
          amount: deposit.amount[0],
        }))
      }
      return undefined
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
        return this.currentNetwork.network_type !== `cosmos`
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
