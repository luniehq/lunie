<template>
  <TmPage
    data-title="Proposal"
    class="readable-width"
    :loading="$apollo.queries.proposal.loading"
  >
    <TmDataNotFound v-if="!found" />
    <template v-else>
      <div class="proposal">
        <div class="page-profile__header__info">
          <span :class="proposal.status | lowerCase" class="proposal-status">
            {{ status.badge }}
          </span>
          <div class="proposal-title__row">
            <h2 class="proposal-title">{{ proposal.title }}</h2>
          </div>
        </div>

        <div class="proposer-row">
          <p class="proposer">
            <template v-if="proposal.validator">
              Proposed by {{ proposal.validator.name }}:
              <Address :address="proposal.proposer" />
            </template>
            <template v-else-if="proposal.proposer">
              Proposed by
              <Address :address="proposal.proposer" />
            </template>
            <template v-else>
              Unknown proposer
            </template>
          </p>
          <div class="button-container">
            <TmBtn
              v-if="proposal.status !== 'Passed'"
              id="deposit-btn"
              value="Deposit"
              :disabled="proposal.status !== 'DepositPeriod'"
              color="primary"
              @click.native="onDeposit"
            />
            <TmBtn
              id="vote-btn"
              value="Vote"
              :disabled="proposal.status !== 'VotingPeriod'"
              color="primary"
              @click.native="() => onVote()"
            />
          </div>
        </div>
      </div>

      <TextBlock :content="proposal.description" />

      <ul v-if="proposal.status === 'DepositPeriod'" class="row">
        <li>
          <h4>Deposit Count</h4>
          <span>
            {{ proposal.deposit }}
            /
            {{ parameters.depositThreshold }}
            {{ parameters.depositDenom || currentNetwork.stakingDenom }}
          </span>
        </li>
      </ul>

      <ul v-if="proposal.status !== `DepositPeriod`" class="row">
        <li v-if="proposal.status === `VotingPeriod`">
          <h4>Total Vote Count</h4>
          <span>
            {{ proposal.tally.totalVotedPercentage | percent }} /
            {{ proposal.tally.total | prettyInt }}
          </span>
        </li>
        <li>
          <h4>Yes</h4>
          <span>
            {{
              noVotes
                ? 0
                : (proposal.tally.yes / proposal.tally.total) | percent
            }}
            /
            {{ proposal.tally.yes | prettyInt }}
          </span>
        </li>
        <li>
          <h4>No</h4>
          <span>
            {{
              noVotes ? 0 : (proposal.tally.no / proposal.tally.total) | percent
            }}
            /
            {{ proposal.tally.no | prettyInt }}
          </span>
        </li>
        <li>
          <h4>Veto</h4>
          <span>
            {{
              noVotes
                ? 0
                : (proposal.tally.veto / proposal.tally.total) | percent
            }}
            /
            {{ proposal.tally.veto | prettyInt }}
          </span>
        </li>
        <li>
          <h4>Abstain</h4>
          <span>
            {{
              noVotes
                ? 0
                : (proposal.tally.abstain / proposal.tally.total) | percent
            }}
            /
            {{ proposal.tally.abstain | prettyInt }}
          </span>
        </li>
      </ul>

      <ul class="row">
        <li>
          <h4>Proposal ID</h4>
          <span>{{ proposal.id }}</span>
        </li>
        <li>
          <h4>Submitted</h4>
          <span v-if="proposal.creationTime">{{
            proposal.creationTime | date
          }}</span>
          <span v-else>--</span>
        </li>
        <template
          v-if="['DepositPeriod', 'VotingPeriod'].includes(proposal.status)"
        >
          <li>
            <h4>({{ status.badge }}) Start Date</h4>
            <span v-if="proposal.statusBeginTime">{{
              proposal.statusBeginTime | date
            }}</span>
            <span v-else>--</span>
          </li>
          <li>
            <h4>({{ status.badge }}) End Date</h4>
            <span v-if="proposal.statusEndTime">
              {{ proposal.statusEndTime | date }} /
              {{ proposal.statusEndTime | fromNow }}
            </span>
            <span v-else>--</span>
          </li>
        </template>
        <template v-else>
          <li>
            <h4>Proposal Finalized ({{ status.badge }})</h4>
            <span>{{ proposal.statusEndTime | date }}</span>
          </li>
        </template>
      </ul>

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
    </template>
  </TmPage>
</template>

<script>
import { mapGetters } from "vuex"
import { percent, prettyInt } from "scripts/num"
import { date, fromNow } from "src/filters"
import TmBtn from "common/TmBtn"
import TmDataNotFound from "common/TmDataNotFound"
import TextBlock from "common/TextBlock"
import ModalDeposit from "src/ActionModal/components/ModalDeposit"
import ModalVote from "src/ActionModal/components/ModalVote"
import ModalVoteSubstrate from "src/ActionModal/components/ModalVoteSubstrate"
import TmPage from "common/TmPage"
import { getProposalStatus } from "scripts/proposal-status"
import { ProposalItem, GovernanceParameters, Vote } from "src/gql"
import BigNumber from "bignumber.js"
import Address from "common/Address"
import gql from "graphql-tag"

export default {
  name: `page-proposal`,
  components: {
    TmBtn,
    ModalDeposit,
    ModalVote,
    ModalVoteSubstrate,
    TmDataNotFound,
    TmPage,
    TextBlock,
    Address,
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
    getNextProposalId() {
      let id = this.getProposalIndex(-1)
      return id
    },
    getPrevProposalId() {
      let id = this.getProposalIndex(1)
      return id
    },
  },
  watch: {
    // Needed to show data loading component when you are browsing from one proposal to another
    $route: function () {
      this.loaded = false
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
    getProposalIndex(num) {
      let proposalsObj = this.proposals
      let proposalsIdArr = Object.values(proposalsObj).map(
        (proposal) => proposal.id
      )
      return proposalsIdArr[proposalsIdArr.indexOf(this.proposal.id) + num]
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
@import "../../styles/proposal-status.css";

.proposal-title__row {
  color: var(--bright);
}

.proposal-title__row a {
  color: var(--bright);
  padding-top: 1rem;
}

.proposal-title__row a:hover {
  color: var(--link-hover);
  padding-top: 1rem;
}

.proposal-title {
  color: var(--bright);
  font-size: var(--h1);
  line-height: 2.25rem;
  font-weight: 500;
  padding-top: 2rem;
}

.proposer {
  font-size: 12px;
  color: var(--txt);
}

.text-block {
  padding: 0 1rem 3rem;
}

.proposer-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 1rem;
  margin: 2rem 0;
}

.button-container {
  display: flex;
  flex-direction: row;
}

.page-profile__header__info {
  padding: 1rem;
}

.button-container button:first-child {
  margin-right: 0.5rem;
}

.read-more-link {
  padding-top: 1rem;
  font-size: 14px;
  display: inline-block;
  cursor: pointer;
}

.read-more-link:hover {
  color: var(--link);
}

@media screen and (max-width: 667px) {
  .proposer-row {
    flex-direction: column;
  }

  .button-container {
    width: 100%;
    padding: 1rem;
  }

  .button-container button {
    width: 100%;
  }
}
</style>
